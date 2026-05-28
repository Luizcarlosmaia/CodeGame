import { describe, expect, it } from "vitest";
import { createCustomRoom, createRoomMembers } from "../test/customRoomFixtures";
import {
  applyMemberRoundResult,
  buildWrongGuess,
  joinMember,
  simulateLoss,
  simulateWinOnTry,
} from "../test/customRoomSimulation";
import { getCustomRoomDailyCode } from "../utils/customRoomDailyCode";
import { isGuessCorrect } from "../utils/verifyGuess";

const PLAYER_COUNTS = [5, 10, 15, 20] as const;

describe.each(PLAYER_COUNTS)("custom room multiplayer (%i jogadores)", (playerCount) => {
  it("ranking reflete vitórias com tentativas diferentes", () => {
    let room = createCustomRoom(1, {
      id: `ROOM-${playerCount}`,
      rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
    });

    const members = createRoomMembers(playerCount, { withProgress: false });
    for (const member of members.slice(1)) {
      room = joinMember(room, member);
    }

    members.forEach((member, index) => {
      const tries = (index % 6) + 1;
      room = simulateWinOnTry(room, member.id, 1, "casual", tries);
    });

    expect(room.membros).toHaveLength(playerCount);
    expect(room.ranking[0].pontos).toBeGreaterThan(0);

    for (let i = 1; i < room.ranking.length; i++) {
      expect(room.ranking[i - 1].pontos).toBeGreaterThanOrEqual(room.ranking[i].pontos);
    }
  });

  it("vitórias e derrotas convivem sem duplicar membros", () => {
    let room = createCustomRoom(1, {
      id: `ROOM-MIX-${playerCount}`,
      rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
    });

    const members = createRoomMembers(playerCount, { withProgress: false });
    for (const member of members.slice(1)) {
      room = joinMember(room, member);
    }

    members.forEach((member, index) => {
      if (index % 2 === 0) {
        room = simulateWinOnTry(room, member.id, 1, "casual", 2);
      } else {
        room = simulateLoss(room, member.id, 1, "casual");
      }
    });

    const winners = room.membros.filter((member) =>
      (member.progresso ?? []).some((entry) => entry.rodada === 1 && entry.win)
    );
    const losers = room.membros.filter((member) =>
      (member.progresso ?? []).some((entry) => entry.rodada === 1 && entry.terminou && !entry.win)
    );

    expect(winners.length).toBe(Math.ceil(playerCount / 2));
    expect(losers.length).toBe(Math.floor(playerCount / 2));
    expect(new Set(room.membros.map((member) => member.id)).size).toBe(playerCount);
  });
});

describe("custom room multiplayer - modos e verificação", () => {
  it("usa código diário determinístico por sala/rodada/modo", () => {
    const room = createCustomRoom(3, { id: "ROOM-MODES" });
    const day = "20260528";

    const casualCode = getCustomRoomDailyCode(room.id, 1, "casual", day);
    const desafioCode = getCustomRoomDailyCode(room.id, 1, "desafio", day);
    const mestreCode = getCustomRoomDailyCode(room.id, 1, "codigo-mestre", day);

    expect(casualCode).not.toEqual(desafioCode);
    expect(isGuessCorrect(casualCode, casualCode, "casual")).toBe(true);
    expect(isGuessCorrect(mestreCode, mestreCode, "codigo-mestre")).toBe(true);
  });

  it("progresso parcial não marca vitória", () => {
    const room = createCustomRoom(1, { id: "ROOM-PARTIAL" });
    const member = room.membros[0];
    const code = getCustomRoomDailyCode(room.id, 1, "casual", "20260528");
    const wrong = buildWrongGuess(code, "casual");

    const updated = applyMemberRoundResult(room, member.id, 1, "casual", [wrong], "20260528");
    const progress = updated.membros[0]?.progresso?.[0];
    expect(progress).toBeDefined();
    if (!progress) return;

    expect(progress.terminou).toBe(false);
    expect(progress.win).toBe(false);
    expect(updated.ranking[0].pontos).toBe(0);
  });

  it("20 jogadores em sequência mantêm ranking consistente", () => {
    let room = createCustomRoom(1, {
      id: "ROOM-SEQ-20",
      rodadas: [
        { rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" },
        { rodada: 2, modo: "desafio", codigo: "", encerrada: false, inicio: "" },
      ],
    });

    const members = createRoomMembers(20, { withProgress: false });
    for (const member of members.slice(1)) {
      room = joinMember(room, member);
    }

    members.forEach((member, index) => {
      room = simulateWinOnTry(room, member.id, 1, "casual", (index % 6) + 1);
    });

    members.slice(0, 10).forEach((member) => {
      room = simulateLoss(room, member.id, 2, "desafio");
    });

    members.slice(10).forEach((member, index) => {
      room = simulateWinOnTry(room, member.id, 2, "desafio", (index % 15) + 1);
    });

    expect(room.membros).toHaveLength(20);
    expect(room.ranking).toHaveLength(20);
    expect(room.ranking.every((entry) => Number.isFinite(entry.pontos))).toBe(true);
  });
});
