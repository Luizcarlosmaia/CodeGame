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
    const today = todayKey();
    if (stored.date === today) {
      return stored;
    } else {
      // Verifica se pulou algum dia
      // Se a diferença de dias for maior que 1, zera a streak
      // Como só temos a data do último jogo, basta ver se não é ontem
      const lastDate = stored.date;
      const last = parseYYYYMMDD(lastDate);
      const now = parseYYYYMMDD(today);
      const diff = daysBetween(last, now);
      return {
        ...stored,
        date: today,
        currentStreak: diff === 1 ? stored.currentStreak : 0,
      };
    }
  } catch {
    return defaultStats();
  }
}

// Utilitário para converter YYYYMMDD em Date
function parseYYYYMMDD(s: string): Date {
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  return new Date(y, m, d);
}

// Retorna diferença em dias entre duas datas (date2 - date1)
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  // Zera hora/min/seg para evitar problemas de fuso
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((utc2 - utc1) / msPerDay);
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
