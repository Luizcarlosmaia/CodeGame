const BR_UTC_OFFSET_HOURS = 3;

function getBrazilDateParts(from) {
  const shifted = new Date(from.getTime() - BR_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

function brazilMidnightUtc(year, month, day) {
  return new Date(Date.UTC(year, month, day, BR_UTC_OFFSET_HOURS, 0, 0, 0));
}

function addBrazilDays(year, month, day, days) {
  const anchor = brazilMidnightUtc(year, month, day);
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return anchor;
}

export function getNextRankingResetAt(periodo, from = new Date()) {
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

export function isRankingResetDue(room, now = Date.now()) {
  if (room.type !== "permanente") return false;
  if (!room.rankingPeriodo || room.rankingPeriodo === "nunca") return false;
  if (!room.rankingResetEm) return false;
  return new Date(room.rankingResetEm).getTime() <= now;
}

export function buildRankingResetPatch(room, now = new Date()) {
  const periodo = room.rankingPeriodo ?? "nunca";

  const membros = (room.membros ?? []).map((member) => ({
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

export function applyPermanentRankingReset(room, now = new Date()) {
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
