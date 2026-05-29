import crypto from "node:crypto";

const JWT_COOKIE = "cg_session";
const JWT_EXPIRY_DAYS = 7;
const SCRYPT_KEYLEN = 64;

export function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_JWT_SECRET não configurada (mín. 16 caracteres)");
  }
  return secret;
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str) {
  const padded = str + "===".slice((str.length + 3) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function signToken(payload) {
  const secret = getJwtSecret();
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRY_DAYS * 86400;
  const body = { ...payload, exp };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64url");
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const secret = getJwtSecret();
    const [encodedHeader, encodedBody, signature] = parts;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedBody}`)
      .digest("base64url");
    if (signature !== expected) return null;

    const payload = JSON.parse(base64urlDecode(encodedBody).toString("utf8"));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

export function parseCookieHeader(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name) cookies[name] = decodeURIComponent(rest.join("="));
  }
  return cookies;
}

export function getTokenFromRequest(headers = {}) {
  const auth = headers.authorization ?? headers.Authorization ?? "";
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const cookieHeader = headers.cookie ?? headers.Cookie ?? "";
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[JWT_COOKIE] ?? null;
}

export function getSessionUser(headers = {}) {
  const token = getTokenFromRequest(headers);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.sub) return null;
  return { id: payload.sub, email: payload.email ?? null };
}

export function buildSessionCookie(token, { secure = false } = {}) {
  const maxAge = JWT_EXPIRY_DAYS * 86400;
  const parts = [
    `${JWT_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearSessionCookie({ secure = false } = {}) {
  const parts = [`${JWT_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function sanitizeUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    hasPassword: Boolean(row.password_hash),
    hasGoogle: Boolean(row.google_sub),
    createdAt: row.created_at,
  };
}

export function signOAuthState(payload) {
  const data = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", getJwtSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyOAuthState(state) {
  if (!state || !state.includes(".")) return null;
  const [data, sig] = state.split(".");
  const expected = crypto
    .createHmac("sha256", getJwtSecret())
    .update(data)
    .digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(base64urlDecode(data).toString("utf8"));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function exchangeGoogleCode(code) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth não configurado");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || tokenData.error || "Falha no token Google");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await userRes.json();
  if (!userRes.ok) {
    throw new Error("Falha ao obter perfil Google");
  }
  return profile;
}

export function getGoogleAuthUrl(state) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth não configurado");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function getFrontendOrigin() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
}

export function isAuthConfigured() {
  try {
    getJwtSecret();
    return true;
  } catch {
    return false;
  }
}
