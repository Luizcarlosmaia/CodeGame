import type { CustomRoom, RankingPeriodo, RoomPlayer } from "../types/customRoom";

const BR_UTC_OFFSET_HOURS = 3;

function getBrazilDateParts(from: Date) {
  const shifted = new Date(from.getTime() - BR_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

function brazilMidnightUtc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day, BR_UTC_OFFSET_HOURS, 0, 0, 0));
}

function addBrazilDays(year: number, month: number, day: number, days: number): Date {
  const anchor = brazilMidnightUtc(year, month, day);
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return anchor;
}

export function getNextRankingResetAt(
  periodo: RankingPeriodo,
  from = new Date()
): string | undefined {
  if (periodo === "nunca") return undefined;

  const { year, month, day, weekday } = getBrazilDateParts(from);

  if (periodo === "semanal") {
    let daysUntilMonday = (8 - weekday) % 7;
    if (daysUntilMonday === 0) daysUntilMonday = 7;
    let candidate = addBrazilDays(year, month, day, daysUntilMonday);
    if (candidate.getTime() <= from.getTime()) {
      candidate = addBrazilDays(year, month, day, daysUntilMonday + 7);
    }
    return candidate.toISOString();
  }

  if (periodo === "mensal") {
    let candidate = brazilMidnightUtc(year, month + 1, 1);
    if (candidate.getTime() <= from.getTime()) {
      candidate = brazilMidnightUtc(year, month + 2, 1);
    }
    return candidate.toISOString();
  }

  return undefined;
}

export function isRankingResetDue(
  room: Pick<CustomRoom, "type" | "rankingPeriodo" | "rankingResetEm">,
  now = Date.now()
): boolean {
  if (room.type !== "permanente") return false;
  if (!room.rankingPeriodo || room.rankingPeriodo === "nunca") return false;
  if (!room.rankingResetEm) return false;
  return new Date(room.rankingResetEm).getTime() <= now;
}

export function buildRankingResetPatch(
  room: Pick<CustomRoom, "type" | "rankingPeriodo" | "membros">,
  now = new Date()
): Partial<CustomRoom> {
  const periodo = room.rankingPeriodo ?? "nunca";

  const membros: RoomPlayer[] = (room.membros ?? []).map((member) => ({
    ...member,
    progresso: [],
    terminouRodada: false,
    tentativas: [],
  }));

  return {
    membros,
    ranking: [],
    progressoRemovidos: [],
    rankingResetEm: getNextRankingResetAt(periodo, now),
  };
}

export function applyPermanentRankingReset<T extends CustomRoom>(room: T, now = new Date()): T {
  if (room.type !== "permanente") return room;

  const periodo = room.rankingPeriodo ?? "nunca";
  let next = room;

  if (periodo !== "nunca" && !room.rankingResetEm) {
    next = {
      ...next,
      rankingResetEm: getNextRankingResetAt(periodo, now),
    };
  }

  if (!isRankingResetDue(next, now.getTime())) return next;

  return {
    ...next,
    ...buildRankingResetPatch(next, now),
  };
}

export function formatRankingPeriodoLabel(periodo: RankingPeriodo = "nunca"): string {
  if (periodo === "semanal") return "Ranking semanal";
  if (periodo === "mensal") return "Ranking mensal";
  return "Ranking contínuo";
}

export function formatRankingPeriodoDescription(
  periodo: RankingPeriodo = "nunca"
): string {
  if (periodo === "semanal") {
    return "Reinicia toda segunda-feira à 00:00 (horário de Brasília).";
  }
  if (periodo === "mensal") {
    return "Reinicia no dia 1 de cada mês à 00:00 (horário de Brasília).";
  }
  return "Pontos acumulam sem reset automático.";
}

export function formatRankingResetCountdown(
  rankingResetEm: string | undefined,
  now = Date.now()
): string | null {
  if (!rankingResetEm) return null;

  const diffMs = new Date(rankingResetEm).getTime() - now;
  if (diffMs <= 0) return "Reiniciando ranking...";

  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

  if (days > 0) {
    return days === 1 ? "Reset em 1 dia" : `Reset em ${days} dias`;
  }
  if (hours > 0) {
    return hours === 1 ? "Reset em 1 hora" : `Reset em ${hours} horas`;
  }

  const minutes = Math.max(totalMinutes, 1);
  return minutes === 1 ? "Reset em 1 min" : `Reset em ${minutes} min`;
}
