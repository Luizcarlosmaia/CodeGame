/**
 * @vitest-environment node
 */
import { describe, expect, it, beforeAll } from "vitest";
import { handleApiRequest } from "./apiHandler.mjs";

const runApiE2E = Boolean(process.env.NEON_API_KEY || process.env.DATABASE_URL);

describe.skipIf(!runApiE2E)("API E2E - autenticação", () => {
  const email = `auth-e2e-${Date.now()}@test.local`;
  const password = "securepass123";
  let token = "";
  let userId = "";

  beforeAll(() => {
    process.env.AUTH_JWT_SECRET =
      process.env.AUTH_JWT_SECRET || "e2e-test-secret-min-16-chars";
  });

  it("rejeita criar sala sem login", async () => {
    const res = await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      body: JSON.stringify({
        id: `NOAUTH-${Date.now()}`,
        nome: "Sem auth",
        type: "permanente",
        ownerId: "x",
        admins: ["x"],
        membros: [{ id: "x", nome: "X", terminouRodada: false, tentativas: [] }],
        modo: "casual",
        rodadaAtual: 1,
        rodadas: [],
        ranking: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
      }),
      headers: {},
    });
    expect(res.status).toBe(401);
  });

  it("registra e retorna token", async () => {
    const reg = await handleApiRequest({
      method: "POST",
      path: "/api/auth/register",
      body: JSON.stringify({
        email,
        password,
        displayName: "Auth E2E",
      }),
      headers: {},
    });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();
    expect(reg.body.user.email).toBe(email.toLowerCase());
    token = reg.body.token;
    userId = reg.body.user.id;
  });

  it("login com credenciais válidas", async () => {
    const login = await handleApiRequest({
      method: "POST",
      path: "/api/auth/login",
      body: JSON.stringify({ email, password }),
      headers: {},
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });

  it("GET /auth/me com Bearer", async () => {
    const me = await handleApiRequest({
      method: "GET",
      path: "/api/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(me.status).toBe(200);
    expect(me.body.user.id).toBe(userId);
  });

  it("cria sala autenticada com accountOwnerId", async () => {
    const roomId = `AUTH-${Date.now()}`;
    const ownerId = "in-room-owner";
    const create = await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: roomId,
        nome: "Sala Auth",
        type: "permanente",
        ownerId,
        admins: [ownerId],
        membros: [
          {
            id: ownerId,
            nome: "Host",
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
        ],
        modo: "casual",
        modos: [{ modo: "casual", rodadas: 1 }],
        rodadaAtual: 1,
        rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
        ranking: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
        rankingPeriodo: "nunca",
      }),
    });
    expect(create.status).toBe(201);

    const loaded = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}`,
    });
    expect(loaded.body.accountOwnerId).toBe(userId);

    const myRooms = await handleApiRequest({
      method: "GET",
      path: "/api/users/me/rooms",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(myRooms.status).toBe(200);
    expect(myRooms.body.some((r) => r.id === roomId)).toBe(true);

    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${roomId}`,
      headers: { authorization: `Bearer ${token}` },
    });
  });

  it("rejeita settings de sala por usuário não dono da conta", async () => {
    const roomId = `AUTH2-${Date.now()}`;
    const ownerId = "host-in-room";
    await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: roomId,
        nome: "Protegida",
        type: "permanente",
        ownerId,
        admins: [ownerId],
        membros: [
          {
            id: ownerId,
            nome: "Host",
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
        ],
        modo: "casual",
        modos: [{ modo: "casual", rodadas: 1 }],
        rodadaAtual: 1,
        rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
        ranking: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
        rankingPeriodo: "nunca",
      }),
    });

    const other = await handleApiRequest({
      method: "POST",
      path: "/api/auth/register",
      body: JSON.stringify({
        email: `other-${Date.now()}@test.local`,
        password: "otherpass123",
        displayName: "Outro",
      }),
      headers: {},
    });

    const forbidden = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/settings`,
      headers: { authorization: `Bearer ${other.body.token}` },
      body: JSON.stringify({
        userId: ownerId,
        nome: "Hack",
      }),
    });
    expect(forbidden.status).toBe(403);

    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${roomId}`,
      headers: { authorization: `Bearer ${token}` },
    });
  });

  it("transfere accountOwnerId apenas para jogador com conta", async () => {
    const roomId = `AUTH-XFER-${Date.now()}`;
    const hostMember = "host-m";
    const guestMember = "guest-m";
    const loggedMember = "logged-m";

    await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: roomId,
        nome: "Transfer",
        type: "permanente",
        ownerId: hostMember,
        admins: [hostMember],
        membros: [
          {
            id: hostMember,
            nome: "Host",
            accountId: userId,
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
          {
            id: guestMember,
            nome: "Guest",
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
        ],
        modo: "casual",
        modos: [{ modo: "casual", rodadas: 1 }],
        rodadaAtual: 1,
        rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
        ranking: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
        rankingPeriodo: "nunca",
      }),
    });

    const other = await handleApiRequest({
      method: "POST",
      path: "/api/auth/register",
      body: JSON.stringify({
        email: `xfer-${Date.now()}@test.local`,
        password: "xferpass123",
        displayName: "Novo Dono",
      }),
      headers: {},
    });
    const otherId = other.body.user.id;
    const otherToken = other.body.token;

    const patchJoin = await handleApiRequest({
      method: "PATCH",
      path: `/api/rooms/${roomId}`,
      headers: { authorization: `Bearer ${otherToken}` },
      body: JSON.stringify({
        membros: [
          {
            id: hostMember,
            nome: "Host",
            accountId: userId,
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
          {
            id: guestMember,
            nome: "Guest",
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
          {
            id: loggedMember,
            nome: "Novo Dono",
            accountId: otherId,
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
        ],
      }),
    });
    expect(patchJoin.status).toBe(200);

    const rejectGuest = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/transfer`,
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId: hostMember,
        targetMemberId: guestMember,
      }),
    });
    expect(rejectGuest.status).toBe(400);

    const xfer = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/transfer`,
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId: hostMember,
        targetMemberId: loggedMember,
      }),
    });
    expect(xfer.status).toBe(200);
    expect(xfer.body.room.accountOwnerId).toBe(otherId);
    expect(xfer.body.room.ownerId).toBe(loggedMember);

    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${roomId}`,
      headers: { authorization: `Bearer ${otherToken}` },
    });
  });

  it("valida link de retomada de visitante", async () => {
    const roomId = `AUTH-RES-${Date.now()}`;
    const guestMember = "guest-res";

    await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        id: roomId,
        nome: "Resume",
        type: "permanente",
        ownerId: "host-r",
        admins: ["host-r"],
        membros: [
          {
            id: "host-r",
            nome: "Host",
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
          {
            id: guestMember,
            nome: "Guest",
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
        ],
        modo: "casual",
        modos: [{ modo: "casual", rodadas: 1 }],
        rodadaAtual: 1,
        rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
        ranking: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
        rankingPeriodo: "nunca",
      }),
    });

    const link = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/members/${guestMember}/resume-link`,
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: "host-r" }),
    });
    expect(link.status).toBe(200);
    expect(link.body.resumeToken).toBeTruthy();

    const ok = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/resume`,
      body: JSON.stringify({
        memberId: guestMember,
        token: link.body.resumeToken,
      }),
      headers: {},
    });
    expect(ok.status).toBe(200);
    expect(ok.body.memberId).toBe(guestMember);

    const reuse = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/resume`,
      body: JSON.stringify({
        memberId: guestMember,
        token: link.body.resumeToken,
      }),
      headers: {},
    });
    expect(reuse.status).toBe(403);

    const link2 = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/members/${guestMember}/resume-link`,
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: "host-r" }),
    });
    expect(link2.body.resumeToken).not.toBe(link.body.resumeToken);

    const kicked = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/settings`,
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId: "host-r",
        kickMemberId: guestMember,
      }),
    });
    expect(kicked.status).toBe(200);

    const afterKick = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/resume`,
      body: JSON.stringify({
        memberId: guestMember,
        token: link2.body.resumeToken,
      }),
      headers: {},
    });
    expect(afterKick.status).toBe(404);

    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${roomId}`,
      headers: { authorization: `Bearer ${token}` },
    });
  });
});
