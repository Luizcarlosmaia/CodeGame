export type Mode = "casual" | "desafio" | "custom";

function statsKey(mode: "casual" | "desafio"): string {
  return `codeGameStats-${mode}`;
}
function seenKey(mode: "casual" | "desafio", dateKey: string): string {
  return `seenStats-${mode}-${dateKey}`;
}

export interface Stats {
  date: string;
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  distribution: Record<number, number>;
}

export function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// default por dia novo:
const defaultStats = (): Stats => ({
  date: todayKey(),
  totalGames: 0,
  totalWins: 0,
  currentStreak: 0,
  bestStreak: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
});

export function loadStats(mode: Mode): Stats {
  if (mode === "custom") {
    return defaultStats();
  }
  try {
    const raw = localStorage.getItem(statsKey(mode));
    if (!raw) return defaultStats();
    const stored: Stats = JSON.parse(raw);
    // reset diário:
    return stored.date === todayKey() ? stored : defaultStats();
  } catch {
    return defaultStats();
  }
}

export function saveStats(mode: Mode, stats: Stats) {
  if (mode === "custom") {
    return defaultStats();
  }
  localStorage.setItem(statsKey(mode), JSON.stringify(stats));
}

export function hasSeenStats(mode: Mode, dateKey: string): boolean {
  if (mode === "custom") return false;
  return localStorage.getItem(seenKey(mode, dateKey)) === "1";
}

export function markStatsSeen(mode: Mode, dateKey: string): void {
  if (mode === "custom") return;
  localStorage.setItem(seenKey(mode, dateKey), "1");
}
