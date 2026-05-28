export type Mode = "casual" | "desafio" | "custom" | "codigo-mestre";

type StatsMode = Extract<Mode, "casual" | "desafio" | "codigo-mestre">;

function statsKey(mode: StatsMode): string {
  return `codeGameStats-${mode}`;
}

function seenKey(mode: StatsMode, dateKey: string): string {
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

function defaultDistribution(mode: StatsMode): Record<number, number> {
  const maxTries =
    mode === "desafio" ? 15 : mode === "codigo-mestre" ? 9 : 6;

  return Object.fromEntries(
    Array.from({ length: maxTries }, (_, index) => [index + 1, 0])
  );
}

const defaultStats = (mode: StatsMode = "casual"): Stats => ({
  date: todayKey(),
  totalGames: 0,
  totalWins: 0,
  currentStreak: 0,
  bestStreak: 0,
  distribution: defaultDistribution(mode),
});

function rolloverStatsForNewDay(stored: Stats, today: string): Stats {
  const last = parseYYYYMMDD(stored.date);
  const now = parseYYYYMMDD(today);
  const diff = daysBetween(last, now);

  return {
    ...stored,
    date: today,
    currentStreak: diff === 1 ? stored.currentStreak : 0,
  };
}

export function loadStats(mode: Mode): Stats {
  if (mode === "custom") {
    return defaultStats("casual");
  }

  const statsMode = mode as StatsMode;

  try {
    const raw = localStorage.getItem(statsKey(statsMode));
    if (!raw) return defaultStats(statsMode);

    const stored: Stats = JSON.parse(raw);
    const today = todayKey();

    if (stored.date === today) {
      return {
        ...defaultStats(statsMode),
        ...stored,
        distribution: {
          ...defaultDistribution(statsMode),
          ...stored.distribution,
        },
      };
    }

    return rolloverStatsForNewDay(
      {
        ...defaultStats(statsMode),
        ...stored,
        distribution: {
          ...defaultDistribution(statsMode),
          ...stored.distribution,
        },
      },
      today
    );
  } catch {
    return defaultStats(statsMode);
  }
}

function parseYYYYMMDD(s: string): Date {
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  return new Date(y, m, d);
}

function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((utc2 - utc1) / msPerDay);
}

export function saveStats(mode: Mode, stats: Stats): void {
  if (mode === "custom") return;
  localStorage.setItem(statsKey(mode as StatsMode), JSON.stringify(stats));
}

export function hasSeenStats(mode: Mode, dateKey: string): boolean {
  if (mode === "custom") return false;
  return localStorage.getItem(seenKey(mode as StatsMode, dateKey)) === "1";
}

export function markStatsSeen(mode: Mode, dateKey: string): void {
  if (mode === "custom") return;
  localStorage.setItem(seenKey(mode as StatsMode, dateKey), "1");
}

export function reloadAllDailyStats(): Record<StatsMode, Stats> {
  return {
    casual: loadStats("casual"),
    desafio: loadStats("desafio"),
    "codigo-mestre": loadStats("codigo-mestre"),
  };
}
