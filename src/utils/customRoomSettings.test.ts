import { describe, expect, it } from "vitest";
import {
  applyKickMember,
  applyModosUpdate,
  applyRankingPeriodoUpdate,
  applyRoomSettings,
  normalizeRoomModos,
  validateRoomName,
} from "./customRoomSettings";
import type { CustomRoom } from "../types/customRoom";

const baseRoom: CustomRoom = {
  id: "ROOM1",
  nome: "Sala Antiga",
  type: "permanente",
  ownerId: "owner1",
  admins: ["owner1"],
  membros: [
    {
      id: "owner1",
      nome: "Dono",
      terminouRodada: false,
      tentativas: [],
      progresso: [{ rodada: 1, data: "20260528", tentativas: 2, terminou: true, win: true }],
    },
    {
      id: "guest1",
      nome: "Convidado",
      terminouRodada: false,
      tentativas: [],
      progresso: [{ rodada: 2, data: "20260528", tentativas: 3, terminou: true, win: false }],
    },
  ],
  modo: "casual",
  rodadaAtual: 1,
  modos: [
    { modo: "casual", rodadas: 1 },
    { modo: "desafio", rodadas: 1 },
  ],
  rodadas: [
    { rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" },
    { rodada: 2, modo: "desafio", codigo: "", encerrada: false, inicio: "" },
  ],
  ranking: [],
  aberta: true,
  criadaEm: "2026-05-27T12:00:00.000Z",
  rankingPeriodo: "nunca",
};

describe("customRoomSettings", () => {
  it("valida nome da sala", () => {
    expect(validateRoomName("  Minha sala  ")).toBe("Minha sala");
    expect(() => validateRoomName("   ")).toThrow(/nome/i);
  });

  it("adiciona modos e novas rodadas", () => {
    const patch = applyModosUpdate(baseRoom, [
      { modo: "casual", rodadas: 1 },
      { modo: "desafio", rodadas: 1 },
      { modo: "codigo-mestre", rodadas: 2 },
    ]);

    expect(patch.modos).toEqual([
      { modo: "casual", rodadas: 1 },
      { modo: "desafio", rodadas: 1 },
      { modo: "codigo-mestre", rodadas: 2 },
    ]);
    expect(patch.rodadas).toHaveLength(4);
    expect(patch.rodadas?.filter((round) => round.modo === "codigo-mestre")).toHaveLength(
      2
    );
  });

  it("remove modos mantém progresso e pontos no ranking", () => {
    const roomWithDesafio: CustomRoom = {
      ...baseRoom,
      modos: [
        { modo: "casual", rodadas: 1 },
        { modo: "desafio", rodadas: 1 },
      ],
      rodadas: [
        { rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" },
        { rodada: 2, modo: "desafio", codigo: "", encerrada: false, inicio: "" },
      ],
      membros: [
        {
          id: "owner1",
          nome: "Dono",
          terminouRodada: false,
          tentativas: [],
          progresso: [
            { rodada: 1, data: "20260528", tentativas: 2, terminou: true, win: true },
            { rodada: 2, data: "20260528", tentativas: 10, terminou: true, win: true },
          ],
        },
      ],
    };

    const patch = applyModosUpdate(roomWithDesafio, [{ modo: "casual", rodadas: 1 }]);

    expect(patch.rodadas).toHaveLength(1);
    expect(patch.rodadas?.[0].modo).toBe("casual");
    expect(patch.membros?.[0].progresso).toHaveLength(2);
    expect(patch.rodadaModoHistorico?.["2"]).toBe("desafio");
    expect(patch.ranking?.[0].pontos).toBe(11);
    expect(normalizeRoomModos({ ...roomWithDesafio, ...patch })).toEqual([
      { modo: "casual", rodadas: 1 },
    ]);
  });

  it("atualiza período do ranking em sala permanente", () => {
    const patch = applyRankingPeriodoUpdate(baseRoom, "semanal");
    expect(patch.rankingPeriodo).toBe("semanal");
    expect(patch.rankingResetEm).toBeTruthy();
  });

  it("expulsa jogador guardando progresso removido", () => {
    const patch = applyKickMember(baseRoom, "guest1", "owner1");
    expect(patch.membros).toHaveLength(1);
    expect(patch.progressoRemovidos?.some((entry) => entry.id === "guest1")).toBe(true);
  });

  it("applyRoomSettings exige anfitrião", () => {
    expect(() =>
      applyRoomSettings(baseRoom, { userId: "guest1", nome: "X" })
    ).toThrow(/anfitrião/i);
  });

  it("applyRoomSettings impede convidado de alterar modos ou expulsar", () => {
    expect(() =>
      applyRoomSettings(baseRoom, {
        userId: "guest1",
        modos: [{ modo: "casual", rodadas: 1 }],
      })
    ).toThrow(/anfitrião/i);

    expect(() =>
      applyRoomSettings(baseRoom, { userId: "guest1", kickMemberId: "guest1" })
    ).toThrow(/anfitrião/i);
  });

  it("applyRoomSettings combina alterações", () => {
    const updated = applyRoomSettings(baseRoom, {
      userId: "owner1",
      nome: "Sala Nova",
      rankingPeriodo: "mensal",
    });
    expect(updated.nome).toBe("Sala Nova");
    expect(updated.rankingPeriodo).toBe("mensal");
  });
});
