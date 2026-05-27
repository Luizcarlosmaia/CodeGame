import type { Handler } from "@netlify/functions";
import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.NEON_API_KEY ?? process.env.DATABASE_URL ?? "";

const sql = neon(connectionString);

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;

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

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function normalizePath(path: string): string {
  return path
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "")
    .replace(/\/+$/, "") || "/";
}

function parseRoute(path: string) {
  const segments = path.split("/").filter(Boolean);
  if (segments[0] !== "rooms") return null;

  if (segments.length === 1) {
    return { kind: "rooms-root" as const };
  }

  const roomId = segments[1];
  if (segments.length === 2) {
    return { kind: "room" as const, roomId };
  }

  if (segments[2] === "exists") {
    return { kind: "room-exists" as const, roomId };
  }

  if (segments[2] === "chat") {
    return { kind: "room-chat" as const, roomId };
  }

  return null;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (!connectionString) {
    return json(500, { error: "NEON_API_KEY não configurada" });
  }

  try {
    await ensureSchema();

    const route = parseRoute(normalizePath(event.path));
    if (!route) {
      return json(404, { error: "Rota não encontrada" });
    }

    if (route.kind === "rooms-root") {
      if (event.httpMethod === "GET") {
        const type = event.queryStringParameters?.type;
        if (type !== "permanente") {
          return json(400, { error: "Parâmetro type=permanente é obrigatório" });
        }

        const rows = await sql`
          SELECT id, data
          FROM rooms
          WHERE data->>'type' = 'permanente'
        `;

        return json(
          200,
          rows.map((row) => ({
            id: row.id,
            ...(row.data as Record<string, unknown>),
          }))
        );
      }

      if (event.httpMethod === "POST") {
        const room = JSON.parse(event.body || "{}") as { id?: string };
        if (!room.id) {
          return json(400, { error: "Campo id é obrigatório" });
        }

        await sql`
          INSERT INTO rooms (id, data, updated_at)
          VALUES (${room.id}, ${JSON.stringify(room)}::jsonb, NOW())
        `;

        return json(201, { ok: true, id: room.id });
      }

      return json(405, { error: "Método não permitido" });
    }

    if (route.kind === "room-exists") {
      if (event.httpMethod !== "GET") {
        return json(405, { error: "Método não permitido" });
      }

      const rows = await sql`
        SELECT 1 FROM rooms WHERE id = ${route.roomId} LIMIT 1
      `;

      return json(200, { exists: rows.length > 0 });
    }

    if (route.kind === "room") {
      if (event.httpMethod === "GET") {
        const rows = await sql`
          SELECT data FROM rooms WHERE id = ${route.roomId} LIMIT 1
        `;

        if (rows.length === 0) {
          return json(200, null);
        }

        return json(200, rows[0].data);
      }

      if (event.httpMethod === "PATCH") {
        const patch = JSON.parse(event.body || "{}") as Record<string, unknown>;
        const rows = await sql`
          SELECT data FROM rooms WHERE id = ${route.roomId} LIMIT 1
        `;

        if (rows.length === 0) {
          return json(404, { error: "Sala não encontrada" });
        }

        const current = rows[0].data as Record<string, unknown>;
        const updated = { ...current, ...patch, id: route.roomId };

        await sql`
          UPDATE rooms
          SET data = ${JSON.stringify(updated)}::jsonb, updated_at = NOW()
          WHERE id = ${route.roomId}
        `;

        return json(200, { ok: true });
      }

      if (event.httpMethod === "DELETE") {
        await sql`DELETE FROM rooms WHERE id = ${route.roomId}`;
        return json(200, { ok: true });
      }

      return json(405, { error: "Método não permitido" });
    }

    if (route.kind === "room-chat") {
      if (event.httpMethod === "GET") {
        const rows = await sql`
          SELECT id, user_id, user_name, text, created_at
          FROM room_messages
          WHERE room_id = ${route.roomId}
          ORDER BY created_at ASC
        `;

        return json(
          200,
          rows.map((row) => ({
            id: String(row.id),
            userId: row.user_id,
            userName: row.user_name,
            text: row.text,
            createdAt: row.created_at,
          }))
        );
      }

      if (event.httpMethod === "POST") {
        const body = JSON.parse(event.body || "{}") as {
          userId?: string;
          userName?: string;
          text?: string;
        };

        if (!body.userId || !body.userName || !body.text) {
          return json(400, { error: "userId, userName e text são obrigatórios" });
        }

        await sql`
          INSERT INTO room_messages (room_id, user_id, user_name, text)
          VALUES (
            ${route.roomId},
            ${body.userId},
            ${body.userName},
            ${body.text}
          )
        `;

        return json(201, { ok: true });
      }

      return json(405, { error: "Método não permitido" });
    }

    return json(404, { error: "Rota não encontrada" });
  } catch (error) {
    console.error(error);
    return json(500, {
      error: error instanceof Error ? error.message : "Erro interno",
    });
  }
};
