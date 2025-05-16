import type { Mode } from "./stats";

const STORAGE_KEY = "codeGameState";

export interface SavedMode {
  code: string[];
  guesses: string[][];
  hasWon: boolean;
  date: string;
}

type AllSaved = Partial<Record<Mode, SavedMode>>;

export function loadGameState(mode: Mode): SavedMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: AllSaved = raw ? JSON.parse(raw) : {};
    return (
      all[mode] ?? {
        code: [],
        guesses: [],
        hasWon: false,
        date: "",
      }
    );
  } catch {
    return { code: [], guesses: [], hasWon: false, date: "" };
  }
}

export function saveGameState(mode: Mode, data: SavedMode): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  const all: AllSaved = raw ? JSON.parse(raw) : {};
  all[mode] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
