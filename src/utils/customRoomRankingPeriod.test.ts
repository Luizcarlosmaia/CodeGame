import { describe, expect, it } from "vitest";
import {
  applyPermanentRankingReset,
  buildRankingResetPatch,
  formatRankingPeriodoLabel,
  getNextRankingResetAt,
  isRankingResetDue,
} from "./customRoomRankingPeriod";
import type { CustomRoom } from "../types/customRoom";

const basePermanentRoom: CustomRoom = {
  id: "ROOM1",
  nome: "Permanente",
  type: "permanente",
  ownerId: "o1",
  admins: ["o1"],
  membros: [
    {
      id: "o1",
      nome: "Dono",
      terminouRodada: false,
      tentativas: [],
      progresso: [
        {
          rodada: 1,
          data: "20260527",
          tentativas: 2,
          terminou: true,
          win: true,
        },
      ],
    },
  ],
  modo: "casual",
  rodadaAtual: 1,
  rodadas: [{ rodada: 1, codigo: "", encerrada: false, inicio: "" }],
  ranking: [{ playerId: "o1", nome: "Dono", pontos: 5 }],
  aberta: true,
  criadaEm: "2026-05-27T12:00:00.000Z",
  rankingPeriodo: "semanal",
  rankingResetEm: "2020-01-01T03:00:00.000Z",
};

describe("customRoomRankingPeriod", () => {
  it("calcula próximo reset semanal", () => {
    const from = new Date("2026-05-27T15:00:00.000Z"); // quarta BR
    const next = getNextRankingResetAt("semanal", from);
    expect(next).toBeTruthy();
    expect(new Date(next!).getTime()).toBeGreaterThan(from.getTime());
  });

  it("detecta reset vencido", () => {
    expect(isRankingResetDue(basePermanentRoom, Date.now())).toBe(true);
  });

  it("zera progresso e ranking no reset", () => {
    const patch = buildRankingResetPatch(basePermanentRoom, new Date("2026-05-28T12:00:00.000Z"));
    expect(patch.ranking).toEqual([]);
    expect(patch.membros?.[0].progresso).toEqual([]);
    expect(patch.rankingResetEm).toBeTruthy();
  });

  it("applyPermanentRankingReset mantém sala contínua", () => {
    const room: CustomRoom = {
      ...basePermanentRoom,
      rankingPeriodo: "nunca",
      rankingResetEm: undefined,
    };
    expect(applyPermanentRankingReset(room)).toBe(room);
  });

  it("formata rótulo do período", () => {
    expect(formatRankingPeriodoLabel("mensal")).toBe("Ranking mensal");
    expect(formatRankingPeriodoLabel("nunca")).toBe("Ranking contínuo");
  });
});
