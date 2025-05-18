// src/utils/gameState.ts

const STORAGE_KEY = "codeGameState";

export type Mode = "casual" | "desafio" | "custom";

export interface SavedMode {
  code: string[]; // array de 4 dígitos do código atual
  guesses: string[][]; // histórico de palpites
  hasWon: boolean; // flag de vitória
  date: string; // YYYYMMDD do dia em que o estado foi salvo
}

const defaultSavedMode = (): SavedMode => ({
  code: [],
  guesses: [],
  hasWon: false,
  date: "",
});

const OBFUSCATION_SALT = "c0d3G@m3S3cr3t";
function encodeCode(code: string[]): string {
  const order = [2, 0, 3, 1];
  const shuffled = order.map((i) => code[i]);
  const salted = shuffled.join("") + OBFUSCATION_SALT;

  return btoa(salted);
}
function decodeCode(encoded: string): string[] {
  try {
    const decoded = atob(encoded);
    // Remove salt
    const codePart = decoded.replace(OBFUSCATION_SALT, "");
    // Desembaralha
    const chars = codePart.split("");
    // Se não for 4 dígitos, retorna vazio
    if (chars.length !== 4) return [];
    const order = [2, 0, 3, 1];
    const unshuffled = [] as string[];
    for (let i = 0; i < 4; i++) {
      unshuffled[order[i]] = chars[i];
    }
    return unshuffled;
  } catch {
    return [];
  }
}

export function loadGameState(mode: Mode): SavedMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<
      string,
      | SavedMode
      | { code: string; guesses: string[][]; hasWon: boolean; date: string }
    > = raw ? JSON.parse(raw) : {};
    let saved = all[mode] || defaultSavedMode();
    // Se o código estiver em base64, decodifica
    if (typeof saved.code === "string") {
      // Faz uma cópia para não mutar o objeto original
      saved = { ...saved, code: decodeCode(saved.code) };
    }
    return saved as SavedMode;
  } catch {
    return defaultSavedMode();
  }
}

export function saveGameState(mode: Mode, data: SavedMode): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, unknown> = raw ? JSON.parse(raw) : {};
    // Salva o código obfuscado em base64
    const toSave = { ...data, code: encodeCode(data.code) };
    all[mode] = toSave;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // falha silenciosa
  }
}
