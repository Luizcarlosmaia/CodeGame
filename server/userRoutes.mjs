import { getSessionUser } from "./auth.mjs";

function errorResponse(status, message) {
  return { status, body: { error: message } };
}

function parseUserPath(path) {
  const segments = path.split("/").filter(Boolean);
  if (segments[0] !== "users") return null;
  if (segments[1] === "me" && segments[2] === "rooms") {
    return { kind: "me-rooms" };
  }
  if (segments[1] === "me" && segments[2] === "sync-local") {
    return { kind: "me-sync-local" };
  }
  return null;
}

async function loadRoom(sql, roomId) {
  const rows = await sql`
    SELECT data FROM rooms WHERE id = ${roomId} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return rows[0].data;
}

export async function handleUserRequest(ctx) {
  const { method, path, body, headers, sql } = ctx;
  const route = parseUserPath(path);
  if (!route) return errorResponse(404, "Rota não encontrada");

  const session = getSessionUser(headers);
  if (!session) return errorResponse(401, "Não autenticado");

  if (route.kind === "me-rooms" && method === "GET") {
    const rows = await sql`
      SELECT m.room_id, m.in_room_member_id, m.role, r.data
      FROM user_room_memberships m
      JOIN rooms r ON r.id = m.room_id
      WHERE m.user_id = ${session.id}
      ORDER BY m.joined_at DESC
    `;

    const rooms = [];
    for (const row of rows) {
      const room = row.data;
      const memberId = row.in_room_member_id;
      const isMember = (room.membros ?? []).some((m) => m.id === memberId);
      if (!isMember) continue;
      rooms.push({
        id: row.room_id,
        ...room,
        membershipRole: row.role,
        inRoomMemberId: row.in_room_member_id,
      });
    }

    return { status: 200, body: rooms };
  }

  if (route.kind === "me-sync-local" && method === "POST") {
    const payload = JSON.parse(body || "{}");

    if (payload.displayName) {
      await sql`
        UPDATE users
        SET display_name = COALESCE(NULLIF(display_name, ''), ${String(payload.displayName).trim()})
        WHERE id = ${session.id}
      `;
    }

    const memberships = payload.roomMemberships ?? [];
    for (const entry of memberships) {
      const roomId = entry.roomId;
      const memberId = entry.memberId;
      const role = entry.role === "owner" ? "owner" : "member";
      if (!roomId || !memberId) continue;

      const room = await loadRoom(sql, roomId);
      if (!room) continue;
      if (!(room.membros ?? []).some((m) => m.id === memberId)) continue;

      await sql`
        INSERT INTO user_room_memberships (user_id, room_id, in_room_member_id, role)
        VALUES (${session.id}, ${roomId}, ${memberId}, ${role})
        ON CONFLICT (user_id, room_id)
        DO UPDATE SET
          in_room_member_id = EXCLUDED.in_room_member_id,
          role = CASE
            WHEN user_room_memberships.role = 'owner' THEN 'owner'
            ELSE EXCLUDED.role
          END
      `;
    }

    return { status: 200, body: { ok: true } };
  }

  return errorResponse(405, "Método não permitido");
}
