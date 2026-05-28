import { describe, expect, it } from "vitest";
import {
  computePlayerTotalScore,
  computeRoomRanking,
  computeRoundScore,
  filterRankingByPlayed,
  formatPlayerPlayStats,
  formatRoomLifetime,
  getPlayerPlayStats,
  getRoomAgeDays,
  hasPlayedAtLeastOnce,
} from "./customRoomStats";
import type { RoomPlayer, RoomRanking } from "../types/customRoom";

describe("customRoomStats", () => {
  const progresso: RoomPlayer["progresso"] = [
    { rodada: 1, data: "20240501", tentativas: 3, terminou: true, win: true },
    { rodada: 2, data: "20240501", tentativas: 5, terminou: true, win: true },
    { rodada: 1, data: "20240502", tentativas: 2, terminou: true, win: true },
    { rodada: 1, data: "20240503", tentativas: 1, terminou: false },
  ];

  it("calcula dias e vezes jogadas", () => {
    expect(getPlayerPlayStats(progresso)).toEqual({
      dias: 2,
      vezesJogadas: 3,
    });
  });

  it("identifica quem já jogou", () => {
    expect(hasPlayedAtLeastOnce(progresso)).toBe(true);
    expect(hasPlayedAtLeastOnce([])).toBe(false);
    expect(hasPlayedAtLeastOnce(undefined)).toBe(false);
  });

  it("filtra ranking sem partidas", () => {
    const ranking: RoomRanking[] = [
      { playerId: "1", nome: "Alice", pontos: 10 },
      { playerId: "2", nome: "Bob", pontos: 20 },
    ];
    const membros: RoomPlayer[] = [
      {
        id: "1",
        nome: "Alice",
        terminouRodada: false,
        tentativas: [],
        progresso,
      },
      {
        id: "2",
        nome: "Bob",
        terminouRodada: false,
        tentativas: [],
        progresso: [],
      },
    ];

    expect(filterRankingByPlayed(ranking, membros)).toEqual([
      { playerId: "1", nome: "Alice", pontos: 10 },
    ]);
  });

  it("formata estatísticas do jogador", () => {
    expect(formatPlayerPlayStats({ dias: 1, vezesJogadas: 1 })).toBe(
      "1 dia · 1 jogo"
    );
    expect(formatPlayerPlayStats({ dias: 3, vezesJogadas: 8 })).toBe(
      "3 dias · 8 jogos"
    );
  });

  it("formata tempo de vida da sala", () => {
    const now = new Date("2024-05-10T12:00:00Z");
    expect(formatRoomLifetime("2024-05-10T10:00:00Z", now)).toBe(
      "Sala ativa há 2 horas"
    );
    expect(formatRoomLifetime("2024-05-09T12:00:00Z", now)).toBe(
      "Sala ativa há 1 dia"
    );
    expect(getRoomAgeDays("2024-05-01T12:00:00Z", now)).toBe(9);
  });
});

describe("custom room scoring (fórmula B)", () => {
  it("pontua vitórias proporcionalmente ao modo", () => {
    expect(computeRoundScore("casual", 1, true)).toBe(6);
    expect(computeRoundScore("casual", 2, true)).toBe(5);
    expect(computeRoundScore("casual", 6, true)).toBe(1);
    expect(computeRoundScore("desafio", 1, true)).toBe(15);
    expect(computeRoundScore("desafio", 15, true)).toBe(1);
    expect(computeRoundScore("codigo-mestre", 1, true)).toBe(12);
    expect(computeRoundScore("codigo-mestre", 12, true)).toBe(1);
  });

  it("derrota ou tentativa inválida vale zero", () => {
    expect(computeRoundScore("casual", 6, false)).toBe(0);
    expect(computeRoundScore("casual", 0, true)).toBe(0);
  });

  it("soma progresso concluído sem penalizar ausências", () => {
    const member: RoomPlayer = {
      id: "1",
      nome: "Ana",
      terminouRodada: false,
      tentativas: [],
      progresso: [
        {
          rodada: 1,
          data: "20240501",
          tentativas: 2,
          terminou: true,
          win: true,
        },
        {
          rodada: 2,
          data: "20240501",
          tentativas: 10,
          terminou: true,
          win: true,
        },
      ],
    };

    const rodadas = [
      { rodada: 1, modo: "casual" },
      { rodada: 2, modo: "desafio" },
      { rodada: 3, modo: "codigo-mestre" },
    ];

    expect(computePlayerTotalScore(member, rodadas)).toBe(11);
  });

  it("ordena ranking com mais pontos primeiro", () => {
    const membros: RoomPlayer[] = [
      {
        id: "1",
        nome: "Ana",
        terminouRodada: false,
        tentativas: [],
        progresso: [
          {
            rodada: 1,
            data: "20240501",
            tentativas: 1,
            terminou: true,
            win: true,
          },
        ],
      },
      {
        id: "2",
        nome: "Bob",
        terminouRodada: false,
        tentativas: [],
        progresso: [
          {
            rodada: 1,
            data: "20240501",
            tentativas: 3,
            terminou: true,
            win: true,
          },
        ],
      },
    ];

    const ranking = computeRoomRanking(membros, [{ rodada: 1, modo: "casual" }]);

    expect(ranking.map((entry) => entry.playerId)).toEqual(["1", "2"]);
    expect(ranking[0].pontos).toBe(6);
    expect(ranking[1].pontos).toBe(4);
  });
});
