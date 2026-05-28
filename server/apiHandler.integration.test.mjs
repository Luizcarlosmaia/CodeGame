/**
 * @vitest-environment node
 */
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { handleApiRequest } from "./apiHandler.mjs";

const runApiE2E = Boolean(process.env.NEON_API_KEY || process.env.DATABASE_URL);

function randomRoomId() {
  return `E2E-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

describe.skipIf(!runApiE2E)("API E2E - salas custom", () => {
  const roomId = randomRoomId();
  const ownerId = "e2e-owner";
  const guestId = "e2e-guest";

  beforeAll(async () => {
    const create = await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      body: JSON.stringify({
        id: roomId,
        nome: "Sala E2E",
        type: "permanente",
        ownerId,
        admins: [ownerId],
        membros: [
          {
            id: ownerId,
            nome: "Owner",
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
  });

  afterAll(async () => {
    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${roomId}`,
    });
  });

  it("GET confirma existência da sala", async () => {
    const exists = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}/exists`,
    });

    expect(exists.status).toBe(200);
    expect(exists.body.exists).toBe(true);
  });

  it("PATCH adiciona segundo jogador e persiste progresso", async () => {
    const loaded = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}`,
    });
    expect(loaded.status).toBe(200);

    const room = loaded.body;
    const membros = [
      ...room.membros,
      {
        id: guestId,
        nome: "Guest",
        terminouRodada: false,
        tentativas: [],
        progresso: [
          {
            rodada: 1,
            data: "20260528",
            tentativas: 2,
            terminou: true,
            win: true,
            palpites: ["1111", "2222"],
          },
        ],
      },
    ];

    const patched = await handleApiRequest({
      method: "PATCH",
      path: `/api/rooms/${roomId}`,
      body: JSON.stringify({ membros }),
    });
    expect(patched.status).toBe(200);

    const reloaded = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}`,
    });

    expect(reloaded.body.membros).toHaveLength(2);
    expect(
      reloaded.body.membros.find((member) => member.id === guestId)?.progresso
    ).toHaveLength(1);
  });

  it("POST chat registra e lista mensagens", async () => {
    const sent = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/chat`,
      body: JSON.stringify({
        userId: ownerId,
        userName: "Owner",
        text: "Olá sala",
      }),
    });
    expect(sent.status).toBe(201);

    const messages = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}/chat`,
    });

    expect(messages.status).toBe(200);
    expect(messages.body.some((msg) => msg.text === "Olá sala")).toBe(true);
  });

  it("POST settings adiciona e remove modos em sala permanente", async () => {
    const withModes = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/settings`,
      body: JSON.stringify({
        userId: ownerId,
        modos: [
          { modo: "casual", rodadas: 1 },
          { modo: "desafio", rodadas: 1 },
        ],
        rankingPeriodo: "semanal",
      }),
    });
    expect(withModes.status).toBe(200);
    expect(withModes.body.room.modos).toHaveLength(2);
    expect(withModes.body.room.rankingPeriodo).toBe("semanal");

    const removeMode = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${roomId}/settings`,
      body: JSON.stringify({
        userId: ownerId,
        modos: [{ modo: "casual", rodadas: 1 }],
      }),
    });
    expect(removeMode.status).toBe(200);
    expect(removeMode.body.room.modos).toHaveLength(1);
    expect(removeMode.body.room.rodadas).toHaveLength(1);
  });
});

describe.skipIf(!runApiE2E)("API E2E - abandonar e excluir sala", () => {
  const roomId = randomRoomId();
  const ownerId = "e2e-leave-owner";
  const guestId = "e2e-leave-guest";

  beforeAll(async () => {
    const create = await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      body: JSON.stringify({
        id: roomId,
        nome: "Sala Leave E2E",
        type: "permanente",
        ownerId,
        admins: [ownerId],
        membros: [
          {
            id: ownerId,
            nome: "Owner",
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
          {
            id: guestId,
            nome: "Guest",
            terminouRodada: true,
            tentativas: [2],
            progresso: [
              {
                rodada: 1,
                data: "20260528",
                tentativas: 2,
                terminou: true,
                win: true,
              },
            ],
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
        progressoRemovidos: [],
      }),
    });

    expect(create.status).toBe(201);
  });

  it("PATCH remove convidado e arquiva progresso (abandono)", async () => {
    const loaded = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}`,
    });
    expect(loaded.status).toBe(200);

    const guest = loaded.body.membros.find((member) => member.id === guestId);
    expect(guest?.progresso).toHaveLength(1);

    const membros = loaded.body.membros.filter((member) => member.id !== guestId);
    const progressoRemovidos = [
      ...(loaded.body.progressoRemovidos ?? []),
      { id: guestId, progresso: guest.progresso },
    ];

    const patched = await handleApiRequest({
      method: "PATCH",
      path: `/api/rooms/${roomId}`,
      body: JSON.stringify({ membros, progressoRemovidos }),
    });
    expect(patched.status).toBe(200);

    const reloaded = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}`,
    });

    expect(reloaded.body.membros).toHaveLength(1);
    expect(reloaded.body.membros[0].id).toBe(ownerId);
    expect(
      reloaded.body.progressoRemovidos.find((entry) => entry.id === guestId)?.progresso
    ).toHaveLength(1);
  });

  it("DELETE remove sala permanentemente", async () => {
    const deleted = await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${roomId}`,
    });
    expect(deleted.status).toBe(200);

    const exists = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${roomId}/exists`,
    });
    expect(exists.body.exists).toBe(false);
  });
});

describe.skipIf(!runApiE2E)("API E2E - sala temporária", () => {
  const tempRoomId = randomRoomId();
  const ownerId = "e2e-temp-owner";
  const futureExpiry = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
  const pastExpiry = new Date(Date.now() - 60_000).toISOString();

  beforeAll(async () => {
    const create = await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      body: JSON.stringify({
        id: tempRoomId,
        nome: "Sala Temp E2E",
        type: "temporaria",
        ownerId,
        admins: [ownerId],
        membros: [
          {
            id: ownerId,
            nome: "Owner Temp",
            terminouRodada: true,
            tentativas: [3],
            progresso: [
              {
                rodada: 1,
                data: "20260528",
                tentativas: 3,
                terminou: true,
                win: true,
              },
            ],
          },
        ],
        modo: "casual",
        modos: [{ modo: "casual", rodadas: 2 }],
        rodadaAtual: 2,
        rodadas: [
          { rodada: 1, modo: "casual", codigo: "", encerrada: true, inicio: "a", fim: "b" },
          { rodada: 2, modo: "casual", codigo: "", encerrada: false, inicio: "c" },
        ],
        ranking: [{ playerId: ownerId, nome: "Owner Temp", pontos: 4 }],
        progressoRemovidos: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
        expiraEm: futureExpiry,
        partidaNumero: 1,
      }),
    });

    expect(create.status).toBe(201);
  });

  afterAll(async () => {
    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${tempRoomId}`,
    });
  });

  it("POST nova-partida zera ranking e progresso", async () => {
    const response = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${tempRoomId}/nova-partida`,
      body: JSON.stringify({ userId: ownerId }),
    });

    expect(response.status).toBe(200);
    expect(response.body.room.partidaNumero).toBe(2);
    expect(response.body.room.ranking).toEqual([]);
    expect(response.body.room.membros[0].progresso).toEqual([]);
    expect(response.body.room.membros[0].tentativas).toEqual([]);
    expect(response.body.room.rodadaAtual).toBe(1);
    expect(response.body.room.rodadas.every((rodada) => !rodada.encerrada)).toBe(true);
  });

  it("rejeita nova-partida em sala permanente", async () => {
    const permanent = randomRoomId();
    await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      body: JSON.stringify({
        id: permanent,
        nome: "Perm",
        type: "permanente",
        ownerId,
        admins: [ownerId],
        membros: [
          {
            id: ownerId,
            nome: "Owner",
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

    const response = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${permanent}/nova-partida`,
      body: JSON.stringify({ userId: ownerId }),
    });

    expect(response.status).toBe(400);

    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${permanent}`,
    });
  });

  it("marca sala expirada após expiraEm e bloqueia nova-partida", async () => {
    const expiredRoomId = randomRoomId();
    await handleApiRequest({
      method: "POST",
      path: "/api/rooms",
      body: JSON.stringify({
        id: expiredRoomId,
        nome: "Expirada",
        type: "temporaria",
        ownerId,
        admins: [ownerId],
        membros: [
          {
            id: ownerId,
            nome: "Owner",
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
        expiraEm: pastExpiry,
        partidaNumero: 1,
      }),
    });

    const novaPartida = await handleApiRequest({
      method: "POST",
      path: `/api/rooms/${expiredRoomId}/nova-partida`,
      body: JSON.stringify({ userId: ownerId }),
    });
    expect(novaPartida.status).toBe(410);

    const loaded = await handleApiRequest({
      method: "GET",
      path: `/api/rooms/${expiredRoomId}`,
    });
    expect(loaded.body.aberta).toBe(false);

    await handleApiRequest({
      method: "DELETE",
      path: `/api/rooms/${expiredRoomId}`,
    });
  });
});
