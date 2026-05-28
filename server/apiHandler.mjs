import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { applyPermanentRankingReset, getNextRankingResetAt } from "./customRoomRankingPeriod.mjs";
import { applyRoomSettings } from "./customRoomSettings.mjs";

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

export async function handleApiRequest({
  method,
  path,
  query = {},
  body = null,
}) {
  if (!connectionString) {
    return errorResponse(500, "NEON_API_KEY não configurada");
  }

  try {
    await ensureSchema();
    const sql = getSql();

    const route = parseRoute(normalizePath(path));
    if (!route) {
      return errorResponse(404, "Rota não encontrada");
    }

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
          return errorResponse(
            400,
            "Parâmetro type=permanente é obrigatório"
          );
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
        const room = JSON.parse(body || "{}");
        if (!room.id) {
          return errorResponse(400, "Campo id é obrigatório");
        }

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

      if (current.ownerId !== payload.userId) {
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
        const patch = JSON.parse(body || "{}");
        const current = await loadRoomWithExpiry(sql, route.roomId);

        if (!current) {
          return errorResponse(404, "Sala não encontrada");
        }

        if (isTemporaryRoomExpired(current)) {
          return errorResponse(410, "Sala expirada");
        }

        const updated = { ...current, ...patch, id: route.roomId };
        await saveRoom(sql, route.roomId, updated);

        return { status: 200, body: { ok: true } };
      }

      if (method === "DELETE") {
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
          return errorResponse(
            400,
            "userId, userName e text são obrigatórios"
          );
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
  } catch (error) {
    console.error(error);
    return errorResponse(
      500,
      error instanceof Error ? error.message : "Erro interno"
    );
  }
}
