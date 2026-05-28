import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  createFreshDailyGameState,
  DAILY_GAME_MODES,
  getDailyCodeForMode,
  resetAllDailyGameStatesIfNewDay,
  resolveDailyGameState,
} from "./dailyReset";
import { loadGameState, saveGameState } from "./gameState";

describe("dailyReset", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("gera código diferente ao mudar o dia", () => {
    const day1 = getDailyCodeForMode("casual", "20260527");
    const day2 = getDailyCodeForMode("casual", "20260528");
    expect(day1).not.toEqual(day2);
  });

  it("resolveDailyGameState reseta palpites e vitória em dia novo", () => {
    saveGameState("casual", {
      code: ["1", "2", "3", "4"],
      guesses: [["9", "9", "9", "9"]],
      hasWon: false,
      date: "20260527",
    });

    const fresh = resolveDailyGameState("casual", "20260528");
    expect(fresh.date).toBe("20260528");
    expect(fresh.guesses).toEqual([]);
    expect(fresh.hasWon).toBe(false);
    expect(fresh.code).toEqual(getDailyCodeForMode("casual", "20260528"));
  });

  it("mantém progresso do mesmo dia", () => {
    const state = createFreshDailyGameState("desafio", "20260527");
    saveGameState("desafio", {
      ...state,
      guesses: [["1", "1", "1", "1"]],
      hasWon: false,
    });

    const resolved = resolveDailyGameState("desafio", "20260527");
    expect(resolved.guesses).toHaveLength(1);
  });

  it("resetAllDailyGameStatesIfNewDay persiste novos códigos para todos os modos", () => {
    saveGameState("casual", {
      code: ["0", "0", "0", "0"],
      guesses: [["1", "2", "3", "4"]],
      hasWon: true,
      date: "20260527",
    });
    saveGameState("codigo-mestre", {
      code: ["1", "2", "3", "4"],
      guesses: [["1", "2", "3", "4"]],
      hasWon: true,
      date: "20260527",
    });

    const changed = resetAllDailyGameStatesIfNewDay("20260528");
    expect(changed).toBe(true);

    const casual = loadGameState("casual");
    const mestre = loadGameState("codigo-mestre");

    expect(casual.date).toBe("20260528");
    expect(casual.guesses).toEqual([]);
    expect(casual.hasWon).toBe(false);
    expect(mestre.date).toBe("20260528");
    expect(mestre.hasWon).toBe(false);
  });

  it("resetAllDailyGameStatesIfNewDay não altera quando o dia é o mesmo", () => {
    for (const mode of DAILY_GAME_MODES) {
      saveGameState(mode, {
        code: getDailyCodeForMode(mode, "20260527"),
        guesses: mode === "casual" ? [["1", "1", "1", "1"]] : [],
        hasWon: false,
        date: "20260527",
      });
    }

    const changed = resetAllDailyGameStatesIfNewDay("20260527");
    expect(changed).toBe(false);
    expect(loadGameState("casual").guesses).toHaveLength(1);
  });
});
