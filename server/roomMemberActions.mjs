import { randomBytes } from "node:crypto";

export function generateResumeToken() {
  return randomBytes(16).toString("base64url");
}

export async function resolveMemberAccountId(sql, roomId, member) {
  if (member?.accountId) return member.accountId;

  const rows = await sql`
    SELECT user_id
    FROM user_room_memberships
    WHERE room_id = ${roomId} AND in_room_member_id = ${member.id}
    LIMIT 1
  `;
  return rows[0]?.user_id ?? null;
}

export async function transferRoomOwnership(ctx, roomId, payload) {
  const { sql, session } = ctx;
  const userId = payload.userId;
  const targetMemberId = payload.targetMemberId;

  if (!userId || !targetMemberId) {
    return { status: 400, body: { error: "userId e targetMemberId são obrigatórios" } };
  }

  const current = await ctx.loadRoom(roomId);
  if (!current) {
    return { status: 404, body: { error: "Sala não encontrada" } };
  }

  if (!current.accountOwnerId) {
    return {
      status: 400,
      body: { error: "Esta sala não suporta transferência por conta" },
    };
  }

  if (!ctx.canManageRoomAsHost(current, session.id, userId)) {
    return { status: 403, body: { error: "Somente o anfitrião pode transferir a sala" } };
  }

  const membros = current.membros ?? [];
  const target = membros.find((m) => m.id === targetMemberId);
  if (!target) {
    return { status: 404, body: { error: "Jogador não encontrado na sala" } };
  }

  const targetAccountId = await resolveMemberAccountId(sql, roomId, target);
  if (!targetAccountId) {
    return {
      status: 400,
      body: { error: "Somente jogadores com conta logada podem ser anfitrião" },
    };
  }

  if (targetAccountId === session.id) {
    return { status: 400, body: { error: "Este jogador já é o dono da sala" } };
  }

  const admins = Array.from(
    new Set([targetMemberId, ...(Array.isArray(current.admins) ? current.admins : [])])
  ).filter((adminId) => membros.some((m) => m.id === adminId));

  const updated = {
    ...current,
    accountOwnerId: targetAccountId,
    ownerId: targetMemberId,
    admins,
  };

  await ctx.saveRoom(roomId, updated);

  const previousOwnerMemberId = current.ownerId;
  if (previousOwnerMemberId) {
    await ctx.upsertRoomMembership(
      sql,
      session.id,
      roomId,
      previousOwnerMemberId,
      "member"
    );
  }
  await ctx.upsertRoomMembership(
    sql,
    targetAccountId,
    roomId,
    targetMemberId,
    "owner"
  );

  return { status: 200, body: { ok: true, room: updated } };
}

export async function validateMemberResume(ctx, roomId, payload) {
  const memberId = payload.memberId;
  const token = payload.token;

  if (!memberId || !token) {
    return { status: 400, body: { error: "memberId e token são obrigatórios" } };
  }

  const current = await ctx.loadRoom(roomId);
  if (!current) {
    return { status: 404, body: { error: "Sala não encontrada" } };
  }

  const member = (current.membros ?? []).find((m) => m.id === memberId);
  if (!member) {
    return { status: 404, body: { error: "Jogador não encontrado na sala" } };
  }

  if (!member.resumeToken || member.resumeToken !== token) {
    return { status: 403, body: { error: "Link inválido ou já utilizado" } };
  }

  if (member.accountId) {
    return {
      status: 400,
      body: { error: "Jogadores com conta devem entrar fazendo login" },
    };
  }

  const membros = (current.membros ?? []).map((m) =>
    m.id === memberId ? { ...m, resumeToken: undefined } : m
  );
  await ctx.saveRoom(roomId, { ...current, membros });

  return {
    status: 200,
    body: {
      ok: true,
      memberId: member.id,
      memberName: member.nome,
      roomId,
      singleUse: true,
    },
  };
}

export async function createMemberResumeLink(ctx, roomId, memberId) {
  const { sql, session } = ctx;
  const payload = JSON.parse(ctx.body || "{}");
  const hostUserId = payload.userId;

  if (!hostUserId) {
    return { status: 400, body: { error: "userId é obrigatório" } };
  }

  const current = await ctx.loadRoom(roomId);
  if (!current) {
    return { status: 404, body: { error: "Sala não encontrada" } };
  }

  if (!current.accountOwnerId) {
    if (current.ownerId !== hostUserId) {
      return { status: 403, body: { error: "Somente o anfitrião pode gerar o link" } };
    }
  } else if (!session || !ctx.canManageRoomAsHost(current, session.id, hostUserId)) {
    return { status: 403, body: { error: "Somente o anfitrião pode gerar o link" } };
  }

  const membros = [...(current.membros ?? [])];
  const index = membros.findIndex((m) => m.id === memberId);
  if (index === -1) {
    return { status: 404, body: { error: "Jogador não encontrado na sala" } };
  }

  const member = membros[index];
  const accountId = await resolveMemberAccountId(sql, roomId, member);
  if (accountId) {
    return {
      status: 400,
      body: { error: "Jogadores com conta usam login em outro aparelho" },
    };
  }

  const resumeToken = generateResumeToken();
  membros[index] = { ...member, resumeToken };

  const updated = { ...current, membros };
  await ctx.saveRoom(roomId, updated);

  return {
    status: 200,
    body: {
      ok: true,
      memberId,
      resumeToken,
    },
  };
}
