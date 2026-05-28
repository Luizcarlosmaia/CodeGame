import { describe, expect, it } from "vitest";
import {
  applyPermanentRankingReset,
  buildRankingResetPatch,
  isRankingResetDue,
} from "./customRoomRankingPeriod";
import {
  applyModosUpdate,
  applyRoomSettings,
} from "./customRoomSettings";
import {
  applyTemporaryRoomExpiry,
  buildNewMatchPatch,
  getTemporaryRoomExpiresAt,
  isRoomPlayable,
  isTemporaryRoomExpired,
  TEMPORARY_ROOM_TTL_MS,
} from "./customRoomLifecycle";
import { getCustomRoomDailyCode } from "./customRoomDailyCode";
import { getCustomRoomProgressKey } from "./customRoomProgress";
import { computePlayerTotalScore } from "./customRoomStats";
import type { CustomRoom } from "../types/customRoom";

function buildTemporaryRoom(overrides?: Partial<CustomRoom>): CustomRoom {
  return {
    id: "TEMP1",
    nome: "Noite de jogo",
    type: "temporaria",
    ownerId: "owner1",
    admins: ["owner1"],
    membros: [
      {
        id: "owner1",
        nome: "Dono",
        terminouRodada: true,
        tentativas: [2],
        progresso: [
          {
            rodada: 1,
            data: "p1",
            tentativas: 2,
            terminou: true,
            win: true,
          },
        ],
      },
      {
        id: "guest1",
        nome: "Convidado",
        terminouRodada: true,
        tentativas: [4],
        progresso: [
          {
            rodada: 1,
            data: "p1",
            tentativas: 4,
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
    ranking: [
      { playerId: "owner1", nome: "Dono", pontos: 5 },
      { playerId: "guest1", nome: "Convidado", pontos: 3 },
    ],
    progressoRemovidos: [{ id: "old", progresso: [] }],
    aberta: true,
    criadaEm: "2026-05-27T10:00:00.000Z",
    expiraEm: "2099-01-01T00:00:00.000Z",
    partidaNumero: 1,
    ...overrides,
  };
}

describe("cenários críticos — nova partida (sala temporária)", () => {
  it("zera ranking, progresso, tentativas e reabre rodadas", () => {
    const room = buildTemporaryRoom();
    const patch = buildNewMatchPatch(room, "owner1");

    expect(patch.partidaNumero).toBe(2);
    expect(patch.ranking).toEqual([]);
    expect(patch.progressoRemovidos).toEqual([]);
    expect(patch.rodadaAtual).toBe(1);
    expect(patch.aberta).toBe(true);

    patch.membros?.forEach((member) => {
      expect(member.progresso).toEqual([]);
      expect(member.tentativas).toEqual([]);
      expect(member.terminouRodada).toBe(false);
    });

    patch.rodadas?.forEach((rodada) => {
      expect(rodada.encerrada).toBe(false);
      expect(rodada.inicio).toBe("");
      expect(rodada.fim).toBeUndefined();
    });
  });

  it("usa chave de progresso por partida após nova rodada", () => {
    const room = buildTemporaryRoom();
    const patch = buildNewMatchPatch(room, "owner1");
    const nextRoom = { ...room, ...patch, partidaNumero: patch.partidaNumero };

    expect(getCustomRoomProgressKey(nextRoom)).toBe("p2");
  });

  it("rejeita nova partida em sala permanente", () => {
    const permanente = { ...buildTemporaryRoom(), type: "permanente" as const };
    expect(() => buildNewMatchPatch(permanente, "owner1")).toThrow(/temporári/i);
  });
});

describe("cenários críticos — expiração 5h", () => {
  it("TTL padrão é exatamente 5 horas", () => {
    expect(TEMPORARY_ROOM_TTL_MS).toBe(5 * 60 * 60 * 1000);
  });

  it("marca sala como fechada após expiraEm", () => {
    const created = new Date("2026-05-27T10:00:00.000Z");
    const expiraEm = getTemporaryRoomExpiresAt(created);
    const expiredAt = new Date(expiraEm).getTime() + 1;

    const room = buildTemporaryRoom({ expiraEm });
    expect(isTemporaryRoomExpired(room, expiredAt)).toBe(true);

    const patched = applyTemporaryRoomExpiry({
      ...room,
      expiraEm: new Date(expiredAt - 1).toISOString(),
    });
    expect(patched.aberta).toBe(false);
    expect(patched.expiradaEm).toBeTruthy();
    expect(isRoomPlayable(patched)).toBe(false);
  });
});

describe("cenários críticos — código diário custom", () => {
  it("muda código da rodada quando o dia muda (sala permanente)", () => {
    const day1 = getCustomRoomDailyCode("ROOM1", 1, "casual", "20260527");
    const day2 = getCustomRoomDailyCode("ROOM1", 1, "casual", "20260528");
    expect(day1).not.toEqual(day2);
  });
});

describe("cenários críticos — modos em sala permanente", () => {
  const permanentBase: CustomRoom = {
    ...buildTemporaryRoom(),
    type: "permanente",
    expiraEm: undefined,
    partidaNumero: undefined,
  };

  it("adiciona modo e rodadas novas", () => {
    const patch = applyModosUpdate(permanentBase, [
      { modo: "casual", rodadas: 1 },
      { modo: "desafio", rodadas: 1 },
      { modo: "codigo-mestre", rodadas: 1 },
    ]);

    expect(patch.modos).toHaveLength(3);
    expect(patch.rodadas).toHaveLength(3);
  });

  it("remove modo mantendo pontos de rodadas antigas no histórico", () => {
    const room: CustomRoom = {
      ...permanentBase,
      membros: [
        {
          id: "owner1",
          nome: "Dono",
          terminouRodada: false,
          tentativas: [],
          progresso: [
            { rodada: 1, data: "20260528", tentativas: 2, terminou: true, win: true },
            { rodada: 2, data: "20260528", tentativas: 5, terminou: true, win: true },
          ],
        },
      ],
    };

    const patch = applyModosUpdate(room, [{ modo: "casual", rodadas: 1 }]);

    expect(patch.rodadas).toHaveLength(1);
    expect(patch.rodadaModoHistorico?.["2"]).toBe("casual");
    expect(patch.membros?.[0].progresso).toHaveLength(2);
    expect(patch.ranking?.[0].pontos).toBeGreaterThan(0);
    expect(
      computePlayerTotalScore(
        patch.membros![0],
        patch.rodadas ?? [],
        { ...room, ...patch }
      )
    ).toBe(patch.ranking?.[0].pontos);
  });

  it("applyRoomSettings combina remoção de modo e período de ranking", () => {
    const updated = applyRoomSettings(permanentBase, {
      userId: "owner1",
      modos: [{ modo: "casual", rodadas: 2 }],
      rankingPeriodo: "semanal",
    });

    expect(updated.modos).toEqual([{ modo: "casual", rodadas: 2 }]);
    expect(updated.rankingPeriodo).toBe("semanal");
    expect(updated.rankingResetEm).toBeTruthy();
  });
});

describe("cenários críticos — reset semanal e mensal", () => {
  const rankingRoom: CustomRoom = {
    ...buildTemporaryRoom(),
    type: "permanente",
    rankingPeriodo: "semanal",
    rankingResetEm: "2020-01-01T03:00:00.000Z",
    expiraEm: undefined,
    partidaNumero: undefined,
    membros: [
      {
        id: "owner1",
        nome: "Dono",
        terminouRodada: false,
        tentativas: [],
        progresso: [
          { rodada: 1, data: "20260528", tentativas: 1, terminou: true, win: true },
        ],
      },
    ],
    ranking: [{ playerId: "owner1", nome: "Dono", pontos: 6 }],
  };

  it("detecta reset semanal vencido", () => {
    expect(isRankingResetDue(rankingRoom, Date.parse("2026-05-27T12:00:00.000Z"))).toBe(
      true
    );
  });

  it("zera progresso e ranking no reset semanal", () => {
    const now = new Date("2026-05-27T12:00:00.000Z");
    const patch = buildRankingResetPatch(rankingRoom, now);

    expect(patch.ranking).toEqual([]);
    expect(patch.membros?.[0].progresso).toEqual([]);
    expect(patch.rankingResetEm).toBeTruthy();

    const next = applyPermanentRankingReset(
      { ...rankingRoom, ...patch },
      now
    );
    expect(next.membros[0].progresso).toEqual([]);
    expect(next.ranking).toEqual([]);
  });

  it("aplica reset mensal da mesma forma", () => {
    const mensal = {
      ...rankingRoom,
      rankingPeriodo: "mensal" as const,
      rankingResetEm: "2020-01-01T03:00:00.000Z",
    };

    expect(isRankingResetDue(mensal, Date.parse("2026-06-02T12:00:00.000Z"))).toBe(
      true
    );

    const patch = buildRankingResetPatch(mensal, new Date("2026-06-02T12:00:00.000Z"));
    expect(patch.membros?.every((m) => m.progresso?.length === 0)).toBe(true);
  });
});
