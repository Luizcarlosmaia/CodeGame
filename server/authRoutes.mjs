import crypto from "node:crypto";
import {
  buildClearSessionCookie,
  buildSessionCookie,
  exchangeGoogleCode,
  getFrontendOrigin,
  getGoogleAuthUrl,
  getSessionUser,
  hashPassword,
  sanitizeUser,
  signOAuthState,
  signToken,
  verifyOAuthState,
  verifyPassword,
} from "./auth.mjs";

function errorResponse(status, message) {
  return { status, body: { error: message } };
}

function okUserResponse(user, token, extra = {}) {
  const secure = process.env.NODE_ENV === "production";
  return {
    status: 200,
    body: { user: sanitizeUser(user), token, ...extra },
    setCookie: buildSessionCookie(token, { secure }),
  };
}

async function findUserByEmail(sql, email) {
  const rows = await sql`
    SELECT * FROM users WHERE lower(email) = lower(${email}) LIMIT 1
  `;
  return rows[0] ?? null;
}

async function findUserById(sql, id) {
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] ?? null;
}

async function findUserByGoogleSub(sql, googleSub) {
  const rows = await sql`
    SELECT * FROM users WHERE google_sub = ${googleSub} LIMIT 1
  `;
  return rows[0] ?? null;
}

async function createUser(sql, { email, passwordHash, googleSub, displayName }) {
  const rows = await sql`
    INSERT INTO users (email, password_hash, google_sub, display_name)
    VALUES (
      ${email ? email.toLowerCase() : null},
      ${passwordHash ?? null},
      ${googleSub ?? null},
      ${displayName ?? "Jogador"}
    )
    RETURNING *
  `;
  return rows[0];
}

function issueToken(user) {
  return signToken({ sub: user.id, email: user.email });
}

function parseAuthPath(path) {
  const segments = path.split("/").filter(Boolean);
  if (segments[0] !== "auth") return null;
  if (segments[1] === "google" && segments[2] === "callback") {
    return { action: "google-callback" };
  }
  return { action: segments[1] ?? "" };
}

export async function handleAuthRequest(ctx) {
  const { method, path, query, body, headers, sql } = ctx;
  const route = parseAuthPath(path);
  if (!route) return errorResponse(404, "Rota não encontrada");

  if (route.action === "register" && method === "POST") {
    const payload = JSON.parse(body || "{}");
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "");
    const displayName = String(payload.displayName ?? "Jogador").trim() || "Jogador";

    if (!email || !email.includes("@")) {
      return errorResponse(400, "E-mail inválido");
    }
    if (password.length < 8) {
      return errorResponse(400, "Senha deve ter pelo menos 8 caracteres");
    }

    const existing = await findUserByEmail(sql, email);
    if (existing) {
      return errorResponse(409, "E-mail já cadastrado");
    }

    const user = await createUser(sql, {
      email,
      passwordHash: hashPassword(password),
      displayName,
    });
    const token = issueToken(user);
    return { ...okUserResponse(user, token), status: 201 };
  }

  if (route.action === "login" && method === "POST") {
    const payload = JSON.parse(body || "{}");
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "");

    const user = await findUserByEmail(sql, email);
    if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
      return errorResponse(401, "E-mail ou senha incorretos");
    }

    const token = issueToken(user);
    return okUserResponse(user, token);
  }

  if (route.action === "logout" && method === "POST") {
    const secure = process.env.NODE_ENV === "production";
    return {
      status: 200,
      body: { ok: true },
      setCookie: buildClearSessionCookie({ secure }),
    };
  }

  if (route.action === "me" && method === "GET") {
    const session = getSessionUser(headers);
    if (!session) return errorResponse(401, "Não autenticado");
    const user = await findUserById(sql, session.id);
    if (!user) return errorResponse(401, "Usuário não encontrado");
    return { status: 200, body: { user: sanitizeUser(user) } };
  }

  if (route.action === "google" && method === "GET") {
    const redirect = String(query.redirect ?? "/custom/criar");
    const state = signOAuthState({
      redirect,
      exp: Date.now() + 10 * 60 * 1000,
      nonce: crypto.randomUUID(),
    });
    try {
      const url = getGoogleAuthUrl(state);
      return { status: 302, redirect: url };
    } catch (error) {
      return errorResponse(
        503,
        error instanceof Error ? error.message : "Google OAuth indisponível"
      );
    }
  }

  if (route.action === "google-callback" && method === "GET") {
    const code = query.code;
    const state = verifyOAuthState(query.state);
    if (!code || !state) {
      return {
        status: 302,
        redirect: `${getFrontendOrigin()}/login?error=oauth_failed`,
      };
    }

    try {
      const profile = await exchangeGoogleCode(code);
      const googleSub = profile.id;
      const email = profile.email;
      const displayName = profile.name || profile.given_name || "Jogador";

      let user = await findUserByGoogleSub(sql, googleSub);
      if (!user && email) {
        user = await findUserByEmail(sql, email);
        if (user) {
          await sql`
            UPDATE users
            SET google_sub = ${googleSub},
                display_name = COALESCE(NULLIF(display_name, ''), ${displayName})
            WHERE id = ${user.id}
          `;
          user = await findUserById(sql, user.id);
        }
      }
      if (!user) {
        user = await createUser(sql, { email, googleSub, displayName });
      }

      const token = issueToken(user);
      const secure = process.env.NODE_ENV === "production";
      const nextPath = state.redirect || "/custom/criar";
      const params = new URLSearchParams({
        token,
        redirect: nextPath,
      });
      const redirectTo = `${getFrontendOrigin()}/login?${params}`;
      return {
        status: 302,
        redirect: redirectTo,
        setCookie: buildSessionCookie(token, { secure }),
      };
    } catch {
      return {
        status: 302,
        redirect: `${getFrontendOrigin()}/login?error=oauth_failed`,
      };
    }
  }

  return errorResponse(404, "Rota não encontrada");
}
