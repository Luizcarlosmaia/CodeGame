import { getNextRankingResetAt } from "./customRoomRankingPeriod.mjs";

function computeRoomRanking(membros, rodadas, room) {
  const historico = room?.rodadaModoHistorico ?? {};

  const getModoForRodada = (rodada) => {
    const active = (rodadas ?? []).find((round) => round.rodada === rodada)?.modo;
    if (active) return active;
    return historico[String(rodada)] || "casual";
  };

  const ranking = (membros ?? []).map((member) => {
    const pontos = (member.progresso ?? []).reduce((total, entry) => {
      if (!entry.terminou) return total;
      const modo = getModoForRodada(entry.rodada);
      const maxTries = modo === "desafio" ? 15 : modo === "codigo-mestre" ? 12 : 6;
      if (!entry.win || entry.tentativas <= 0) return total;
      const tries = Math.min(Math.max(entry.tentativas, 1), maxTries);
      return total + (maxTries - tries + 1);
    }, 0);

    return { playerId: member.id, nome: member.nome, pontos };
  });

  ranking.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  return ranking;
}

export function normalizeRoomModos(room) {
  if (room.modos?.length) {
    return room.modos.map((entry) => ({
      modo: entry.modo,
      rodadas: Math.max(0, entry.rodadas),
    }));
  }

  const counts = (room.rodadas ?? []).reduce((acc, round) => {
    const modo = round.modo || room.modo || "casual";
    acc[modo] = (acc[modo] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([modo, rodadas]) => ({ modo, rodadas }));
}

function validateRoomName(nome) {
  const trimmed = String(nome ?? "").trim();
  if (!trimmed) throw new Error("Digite um nome para a sala.");
  if (trimmed.length > 20) {
    throw new Error("O nome da sala pode ter no máximo 20 caracteres.");
  }
  return trimmed;
}

function validateRoomModos(modos) {
  const sanitized = modos
    .map((entry) => ({
      modo: entry.modo,
      rodadas: Math.max(0, Math.floor(entry.rodadas)),
    }))
    .filter((entry) => entry.rodadas > 0);

  if (sanitized.length === 0) {
    throw new Error("A sala precisa ter pelo menos um modo com uma rodada.");
  }

  return sanitized;
}

function rebuildRodadaModoHistorico(room) {
  const historico = { ...(room.rodadaModoHistorico ?? {}) };

  for (const round of room.rodadas ?? []) {
    historico[String(round.rodada)] = round.modo || room.modo || "casual";
  }

  return historico;
}

function syncRodadasWithModos(room, modosInput) {
  const modos = validateRoomModos(modosInput);
  const historico = rebuildRodadaModoHistorico(room);
  const existingRodadas = [...(room.rodadas ?? [])];

  const byModo = new Map();
  for (const round of existingRodadas) {
    const modo = round.modo || room.modo || "casual";
    const list = byModo.get(modo) ?? [];
    list.push(round);
    byModo.set(modo, list);
  }
  for (const list of byModo.values()) {
    list.sort((a, b) => a.rodada - b.rodada);
  }

  let nextRodadaNum =
    existingRodadas.reduce((max, round) => Math.max(max, round.rodada), 0) + 1;
  if (existingRodadas.length === 0) nextRodadaNum = 1;

  const rodadas = [];

  for (const { modo, rodadas: targetCount } of modos) {
    const pool = byModo.get(modo) ?? [];
    const kept = pool.slice(0, targetCount);

    for (const round of kept) {
      rodadas.push({ ...round, modo });
      historico[String(round.rodada)] = modo;
    }

    for (let i = kept.length; i < targetCount; i++) {
      const rodadaNum = nextRodadaNum;
      nextRodadaNum += 1;
      rodadas.push({
        rodada: rodadaNum,
        modo,
        codigo: "",
        encerrada: false,
        inicio: "",
      });
      historico[String(rodadaNum)] = modo;
    }
  }

  rodadas.sort((a, b) => a.rodada - b.rodada);

  const roomWithHistorico = { ...room, rodadas, rodadaModoHistorico: historico };

  return {
    modos,
    rodadas,
    modo: modos[0]?.modo ?? room.modo,
    rodadaModoHistorico: historico,
    ranking: computeRoomRanking(room.membros ?? [], rodadas, roomWithHistorico),
  };
}

function applyModosUpdate(room, modosInput) {
  const synced = syncRodadasWithModos(room, modosInput);

  return {
    ...synced,
    membros: room.membros,
  };
}

function applyRankingPeriodoUpdate(room, rankingPeriodo) {
  if (room.type !== "permanente") {
    throw new Error("Reset do ranking só se aplica a salas permanentes.");
  }

  if (rankingPeriodo === "nunca") {
    return { rankingPeriodo, rankingResetEm: undefined };
  }

  return {
    rankingPeriodo,
    rankingResetEm: getNextRankingResetAt(rankingPeriodo),
  };
}

function applyKickMember(room, memberId, ownerId) {
  if (memberId === ownerId) {
    throw new Error("O anfitrião não pode ser expulso da sala.");
  }

  const target = (room.membros ?? []).find((member) => member.id === memberId);
  if (!target) {
    throw new Error("Jogador não encontrado na sala.");
  }

  let progressoRemovidos = [...(room.progressoRemovidos ?? [])];
  if (target.progresso?.length) {
    progressoRemovidos = progressoRemovidos.filter((entry) => entry.id !== memberId);
    progressoRemovidos.push({ id: memberId, progresso: target.progresso });
  }

  const membros = (room.membros ?? []).filter((member) => member.id !== memberId);

  return {
    membros,
    progressoRemovidos,
    ranking: computeRoomRanking(membros, room.rodadas ?? [], room),
  };
}

export function applyRoomSettings(room, payload) {
  if (room.ownerId !== payload.userId) {
    throw new Error("Somente o anfitrião pode alterar as configurações da sala.");
  }

  let next = { ...room };

  if (payload.kickMemberId) {
    next = { ...next, ...applyKickMember(next, payload.kickMemberId, payload.userId) };
  }

  if (payload.nome !== undefined) {
    next = { ...next, nome: validateRoomName(payload.nome) };
  }

  if (payload.modos) {
    next = { ...next, ...applyModosUpdate(next, payload.modos) };
  }

  if (payload.rankingPeriodo !== undefined) {
    next = { ...next, ...applyRankingPeriodoUpdate(next, payload.rankingPeriodo) };
  }

  return next;
}
