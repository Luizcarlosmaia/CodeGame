import { generateDailyCode } from "./generateDailyCode";
import {
  loadGameState,
  saveGameState,
  type Mode,
  type SavedMode,
} from "./gameState";
import { todayKey } from "./stats";

export const DAILY_GAME_MODES = [
  "casual",
  "desafio",
  "codigo-mestre",
] as const;

export type DailyGameMode = (typeof DAILY_GAME_MODES)[number];

export function isDailyGameMode(mode: Mode): mode is DailyGameMode {
  return (DAILY_GAME_MODES as readonly Mode[]).includes(mode);
}

export function getDailyCodeForMode(
  mode: DailyGameMode,
  day: string = todayKey()
): string[] {
  if (mode === "codigo-mestre") {
    return generateDailyCode(`${day}-codigo-mestre`, "codigo-mestre");
  }

  return generateDailyCode(`${day}-${mode}`);
}

export function createFreshDailyGameState(
  mode: DailyGameMode,
  day: string = todayKey()
): SavedMode {
  return {
    code: getDailyCodeForMode(mode, day),
    guesses: [],
    hasWon: false,
    date: day,
  };
}

export function resolveDailyGameState(
  mode: DailyGameMode,
  day: string = todayKey()
): SavedMode {
  const saved = loadGameState(mode);

  if (saved.date !== day) {
    return createFreshDailyGameState(mode, day);
  }

  const code =
    Array.isArray(saved.code) && saved.code.length === 4
      ? saved.code
      : getDailyCodeForMode(mode, day);

  return {
    date: day,
    code,
    guesses: Array.isArray(saved.guesses) ? saved.guesses : [],
    hasWon: Boolean(saved.hasWon),
  };
}

export function isDailyChallengeFinished(
  mode: DailyGameMode,
  day: string = todayKey(),
  maxTries: number
): boolean {
  const saved = loadGameState(mode);
  if (saved.date !== day) return false;

  return saved.hasWon || saved.guesses.length >= maxTries;
}

export function buildDailyGameStateRecord(
  day: string = todayKey()
): Record<DailyGameMode, SavedMode> {
  return DAILY_GAME_MODES.reduce(
    (acc, mode) => {
      acc[mode] = resolveDailyGameState(mode, day);
      return acc;
    },
    {} as Record<DailyGameMode, SavedMode>
  );
}

/** Persiste novos códigos do dia quando a data mudou. Retorna true se houve reset. */
export function resetAllDailyGameStatesIfNewDay(
  day: string = todayKey()
): boolean {
  let changed = false;

  for (const mode of DAILY_GAME_MODES) {
    const saved = loadGameState(mode);
    if (saved.date !== day) {
      saveGameState(mode, createFreshDailyGameState(mode, day));
      changed = true;
    }
  }

  return changed;
}
