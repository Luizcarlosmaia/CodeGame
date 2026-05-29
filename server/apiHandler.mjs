import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { applyPermanentRankingReset, getNextRankingResetAt } from "./customRoomRankingPeriod.mjs";
import { applyRoomSettings } from "./customRoomSettings.mjs";
import { getSessionUser, isAuthConfigured } from "./auth.mjs";
import { handleAuthRequest } from "./authRoutes.mjs";
import { handleUserRequest } from "./userRoutes.mjs";
import {
  createMemberResumeLink,
  transferRoomOwnership,
  validateMemberResume,
} from "./roomMemberActions.mjs";

function loadEnvFile() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env opcional em produção (Netlify injeta variáveis)
  }
}

loadEnvFile();

const connectionString =
  process.env.NEON_API_KEY ?? process.env.DATABASE_URL ?? "";

let sql = null;

function getSql() {
  if (!sql) {
    if (!connectionString) {
      throw new Error("NEON_API_KEY não configurada");
    }
    sql = neon(connectionString);
  }
  return sql;
}

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;

  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS room_messages (
      id SERIAL PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_room_messages_room_id
    ON room_messages(room_id)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE,
      password_hash TEXT,
      google_sub TEXT UNIQUE,
      display_name TEXT NOT NULL DEFAULT 'Jogador',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_room_memberships (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      in_room_member_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, room_id)
    )
  `;
  schemaReady = true;
}

function normalizePath(path) {
  return path
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "")
    .replace(/\/+$/, "") || "/";
}

function parseRoute(path) {
  const segments = path.split("/").filter(Boolean);
  if (segments[0] !== "rooms") return null;

  if (segments.length === 1) {
    return { kind: "rooms-root" };
  }

  if (segments[1] === "cleanup-expired") {
    return { kind: "rooms-cleanup-expired" };
  }

  const roomId = segments[1];
  if (segments.length === 2) {
    return { kind: "room", roomId };
  }

  if (segments[2] === "exists") {
    return { kind: "room-exists", roomId };
  }

  if (segments[2] === "chat") {
    return { kind: "room-chat", roomId };
  }

  if (segments[2] === "nova-partida") {
    return { kind: "room-nova-partida", roomId };
  }

  if (segments[2] === "settings") {
    return { kind: "room-settings", roomId };
  }

  if (segments[2] === "transfer") {
    return { kind: "room-transfer", roomId };
  }

  if (segments[2] === "resume") {
    return { kind: "room-resume", roomId };
  }

  if (segments[2] === "members" && segments[4] === "resume-link") {
    return { kind: "room-resume-link", roomId, memberId: segments[3] };
  }

  return null;
}

function errorResponse(status, message) {
  return { status, body: { error: message } };
}

function isTemporaryRoomExpired(room, now = Date.now()) {
  if (room?.type !== "temporaria" || !room?.expiraEm) return false;
  return new Date(room.expiraEm).getTime() <= now;
}

function applyTemporaryRoomExpiry(room) {
  if (!isTemporaryRoomExpired(room)) return room;
  if (room.aberta === false && room.expiradaEm) return room;
  return {
    ...room,
    aberta: false,
    expiradaEm: room.expiradaEm ?? new Date().toISOString(),
  };
}

async function loadRoom(sql, roomId) {
  const rows = await sql`
    SELECT data FROM rooms WHERE id = ${roomId} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0].data;
}

async function saveRoom(sql, roomId, room) {
  await sql`
    UPDATE rooms
    SET data = ${JSON.stringify(room)}::jsonb, updated_at = NOW()
    WHERE id = ${roomId}
  `;
}

async function loadRoomWithExpiry(sql, roomId) {
  const current = await loadRoom(sql, roomId);
  if (!current) return null;

  let updated = applyTemporaryRoomExpiry(current);
  updated = applyPermanentRankingReset(updated);

  if (updated !== current) {
    await saveRoom(sql, roomId, updated);
  }
  return updated;
}

function assertCronAuthorized(query) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return query.secret === secret;
}

/** Anfitrião com conta ou sala legada (ownerId in-room). */
function canManageRoomAsHost(room, accountUserId, inRoomUserId) {
  if (room.accountOwnerId) {
    if (room.accountOwnerId !== accountUserId) return false;
    const actor = (room.membros ?? []).find((m) => m.id === inRoomUserId);
    if (actor?.accountId) return actor.accountId === accountUserId;
    return room.ownerId === inRoomUserId;
  }
  return room.ownerId === inRoomUserId;
}

function linkOwnerMemberToAccount(room, accountUserId) {
  const ownerMemberId = room.ownerId ?? room.membros?.[0]?.id;
  if (!ownerMemberId || !Array.isArray(room.membros)) return room;

  room.membros = room.membros.map((member) =>
    member.id === ownerMemberId
      ? { ...member, accountId: member.accountId ?? accountUserId }
      : member
  );
  return room;
}

async function upsertRoomMembership(sql, userId, roomId, memberId, role) {
  await sql`
    INSERT INTO user_room_memberships (user_id, room_id, in_room_member_id, role)
    VALUES (${userId}, ${roomId}, ${memberId}, ${role})
    ON CONFLICT (user_id, room_id)
    DO UPDATE SET
      in_room_member_id = EXCLUDED.in_room_member_id,
      role = CASE
        WHEN user_room_memberships.role = 'owner' THEN 'owner'
        ELSE EXCLUDED.role
      END
  `;
}

async function handleRoomsRequest(ctx) {
  const { method, path, query, body, headers } = ctx;
  const sql = ctx.sql;
  const route = parseRoute(path);

  if (!route) {
    return errorResponse(404, "Rota não encontrada");
  }

  const session = getSessionUser(headers);

  if (route.kind === "rooms-cleanup-expired") {
    if (method !== "POST") {
      return errorResponse(405, "Método não permitido");
    }

    if (!assertCronAuthorized(query)) {
      return errorResponse(401, "Não autorizado");
    }

    const rows = await sql`
      DELETE FROM rooms
      WHERE data->>'type' = 'temporaria'
        AND data->>'expiraEm' IS NOT NULL
        AND (data->>'expiraEm')::timestamptz <= NOW()
      RETURNING id
    `;

    return {
      status: 200,
      body: {
        ok: true,
        deleted: rows.length,
        ids: rows.map((row) => row.id),
      },
    };
  }

  if (route.kind === "rooms-root") {
    if (method === "GET") {
      if (query.type !== "permanente") {
        return errorResponse(400, "Parâmetro type=permanente é obrigatório");
      }

      const rows = await sql`
        SELECT id, data
        FROM rooms
        WHERE data->>'type' = 'permanente'
      `;

      return {
        status: 200,
        body: rows.map((row) => ({
          id: row.id,
          ...row.data,
        })),
      };
    }

    if (method === "POST") {
      if (!session) {
        return errorResponse(401, "Faça login para criar uma sala");
      }

      const room = JSON.parse(body || "{}");
      if (!room.id) {
        return errorResponse(400, "Campo id é obrigatório");
      }

      room.accountOwnerId = session.id;
      linkOwnerMemberToAccount(room, session.id);

      if (room.type === "permanente") {
        const periodo = room.rankingPeriodo ?? "nunca";
        room.rankingPeriodo = periodo;
        if (periodo !== "nunca" && !room.rankingResetEm) {
          room.rankingResetEm = getNextRankingResetAt(periodo);
        }
      }

      await sql`
        INSERT INTO rooms (id, data, updated_at)
        VALUES (${room.id}, ${JSON.stringify(room)}::jsonb, NOW())
      `;

      const ownerMemberId = room.ownerId ?? room.membros?.[0]?.id;
      if (ownerMemberId) {
        await upsertRoomMembership(sql, session.id, room.id, ownerMemberId, "owner");
      }

      return { status: 201, body: { ok: true, id: room.id } };
    }

    return errorResponse(405, "Método não permitido");
  }

  if (route.kind === "room-exists") {
    if (method !== "GET") {
      return errorResponse(405, "Método não permitido");
    }

    const room = await loadRoomWithExpiry(sql, route.roomId);
    return { status: 200, body: { exists: room !== null } };
  }

  if (route.kind === "room-nova-partida") {
    if (method !== "POST") {
      return errorResponse(405, "Método não permitido");
    }

    const payload = JSON.parse(body || "{}");
    if (!payload.userId) {
      return errorResponse(400, "userId é obrigatório");
    }

    const current = await loadRoomWithExpiry(sql, route.roomId);
    if (!current) {
      return errorResponse(404, "Sala não encontrada");
    }

    if (current.type !== "temporaria") {
      return errorResponse(400, "Nova partida só em salas temporárias");
    }

    if (isTemporaryRoomExpired(current)) {
      return errorResponse(410, "Sala expirada");
    }

    if (current.accountOwnerId) {
      if (!session || !canManageRoomAsHost(current, session.id, payload.userId)) {
        return errorResponse(403, "Somente o anfitrião pode iniciar nova partida");
      }
    } else if (current.ownerId !== payload.userId) {
      return errorResponse(403, "Somente o anfitrião pode iniciar nova partida");
    }

    const membros = (current.membros ?? []).map((member) => ({
      ...member,
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    }));

    const updated = {
      ...current,
      membros,
      ranking: [],
      progressoRemovidos: [],
      partidaNumero: (current.partidaNumero ?? 1) + 1,
      aberta: true,
      rodadaAtual: 1,
      rodadas: (current.rodadas ?? []).map((rodada) => ({
        ...rodada,
        encerrada: false,
        inicio: "",
        fim: undefined,
      })),
    };

    await saveRoom(sql, route.roomId, updated);
    return { status: 200, body: { ok: true, room: updated } };
  }

  const roomActionCtx = {
    sql,
    session,
    body,
    loadRoom: (id) => loadRoomWithExpiry(sql, id),
    saveRoom: (id, room) => saveRoom(sql, id, room),
    canManageRoomAsHost,
    upsertRoomMembership,
  };

  if (route.kind === "room-transfer") {
    if (method !== "POST") {
      return errorResponse(405, "Método não permitido");
    }
    if (!session) {
      return errorResponse(401, "Login necessário para transferir a sala");
    }
    const payload = JSON.parse(body || "{}");
    return transferRoomOwnership(roomActionCtx, route.roomId, payload);
  }

  if (route.kind === "room-resume") {
    if (method !== "POST") {
      return errorResponse(405, "Método não permitido");
    }
    const payload = JSON.parse(body || "{}");
    return validateMemberResume(roomActionCtx, route.roomId, payload);
  }

  if (route.kind === "room-resume-link") {
    if (method !== "POST") {
      return errorResponse(405, "Método não permitido");
    }
    return createMemberResumeLink(roomActionCtx, route.roomId, route.memberId);
  }

  if (route.kind === "room-settings") {
    if (method !== "POST") {
      return errorResponse(405, "Método não permitido");
    }

    const payload = JSON.parse(body || "{}");
    if (!payload.userId) {
      return errorResponse(400, "userId é obrigatório");
    }

    const current = await loadRoomWithExpiry(sql, route.roomId);
    if (!current) {
      return errorResponse(404, "Sala não encontrada");
    }

    if (isTemporaryRoomExpired(current)) {
      return errorResponse(410, "Sala expirada");
    }

    if (current.accountOwnerId) {
      if (!session || !canManageRoomAsHost(current, session.id, payload.userId)) {
        return errorResponse(403, "Somente o anfitrião pode alterar as configurações da sala");
      }
    }

    try {
      const updated = applyRoomSettings(current, payload);
      await saveRoom(sql, route.roomId, updated);
      return { status: 200, body: { ok: true, room: updated } };
    } catch (error) {
      return errorResponse(
        400,
        error instanceof Error ? error.message : "Configuração inválida"
      );
    }
  }

  if (route.kind === "room") {
    if (method === "GET") {
      const room = await loadRoomWithExpiry(sql, route.roomId);
      if (!room) {
        return { status: 200, body: null };
      }
      return { status: 200, body: room };
    }

    if (method === "PATCH") {
      let patch = JSON.parse(body || "{}");
      const current = await loadRoomWithExpiry(sql, route.roomId);

      if (!current) {
        return errorResponse(404, "Sala não encontrada");
      }

      if (isTemporaryRoomExpired(current)) {
        return errorResponse(410, "Sala expirada");
      }

      if (
        current.accountOwnerId &&
        (patch.ownerId !== undefined || patch.accountOwnerId !== undefined)
      ) {
        return errorResponse(
          403,
          "Use POST /rooms/:id/transfer para transferir a anfitrião"
        );
      }

      let patchMembros = patch.membros;
      if (session && patchMembros) {
        const prevIds = (current.membros ?? []).map((m) => m.id);
        patchMembros = patchMembros.map((member) => {
          if (prevIds.includes(member.id)) return member;
          return { ...member, accountId: session.id };
        });
        patch = { ...patch, membros: patchMembros };
      }

      const updated = { ...current, ...patch, id: route.roomId };
      await saveRoom(sql, route.roomId, updated);

      if (session && patchMembros) {
        const memberIds = patchMembros.map((m) => m.id);
        const prevIds = (current.membros ?? []).map((m) => m.id);
        const joined = memberIds.filter((id) => !prevIds.includes(id));
        for (const memberId of joined) {
          const role =
            updated.ownerId === memberId && updated.accountOwnerId === session.id
              ? "owner"
              : "member";
          await upsertRoomMembership(sql, session.id, route.roomId, memberId, role);
        }
      }

      return { status: 200, body: { ok: true } };
    }

    if (method === "DELETE") {
      const current = await loadRoom(sql, route.roomId);
      if (current?.accountOwnerId) {
        const payload = JSON.parse(body || "{}");
        if (!session || current.accountOwnerId !== session.id) {
          return errorResponse(403, "Somente o dono da conta pode excluir esta sala");
        }
      }

      await sql`DELETE FROM rooms WHERE id = ${route.roomId}`;
      return { status: 200, body: { ok: true } };
    }

    return errorResponse(405, "Método não permitido");
  }

  if (route.kind === "room-chat") {
    if (method === "GET") {
      const room = await loadRoomWithExpiry(sql, route.roomId);
      if (!room) {
        return errorResponse(404, "Sala não encontrada");
      }

      const rows = await sql`
        SELECT id, user_id, user_name, text, created_at
        FROM room_messages
        WHERE room_id = ${route.roomId}
        ORDER BY created_at ASC
      `;

      return {
        status: 200,
        body: rows.map((row) => ({
          id: String(row.id),
          userId: row.user_id,
          userName: row.user_name,
          text: row.text,
          createdAt: row.created_at,
        })),
      };
    }

    if (method === "POST") {
      const room = await loadRoomWithExpiry(sql, route.roomId);
      if (!room) {
        return errorResponse(404, "Sala não encontrada");
      }

      if (isTemporaryRoomExpired(room)) {
        return errorResponse(410, "Sala expirada");
      }

      const payload = JSON.parse(body || "{}");

      if (!payload.userId || !payload.userName || !payload.text) {
        return errorResponse(400, "userId, userName e text são obrigatórios");
      }

      await sql`
        INSERT INTO room_messages (room_id, user_id, user_name, text)
        VALUES (
          ${route.roomId},
          ${payload.userId},
          ${payload.userName},
          ${payload.text}
        )
      `;

      return { status: 201, body: { ok: true } };
    }

    return errorResponse(405, "Método não permitido");
  }

  return errorResponse(404, "Rota não encontrada");
}

export async function handleApiRequest({
  method,
  path,
  query = {},
  body = null,
  headers = {},
}) {
  if (!connectionString) {
    return errorResponse(500, "NEON_API_KEY não configurada");
  }

  try {
    await ensureSchema();
    const sql = getSql();
    const normalized = normalizePath(path);
    const ctx = { method, path: normalized, query, body, headers, sql };

    if (normalized.startsWith("/auth")) {
      if (!isAuthConfigured()) {
        return errorResponse(503, "AUTH_JWT_SECRET não configurada no servidor");
      }
      return handleAuthRequest(ctx);
    }

    if (normalized.startsWith("/users")) {
      if (!isAuthConfigured()) {
        return errorResponse(503, "AUTH_JWT_SECRET não configurada no servidor");
      }
      return handleUserRequest(ctx);
    }

    if (normalized.startsWith("/rooms")) {
      return handleRoomsRequest(ctx);
    }

    return errorResponse(404, "Rota não encontrada");
  } catch (error) {
    console.error(error);
    return errorResponse(
      500,
      error instanceof Error ? error.message : "Erro interno"
    );
  }
}
