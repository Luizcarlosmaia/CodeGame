import type { CustomRoom, RankingPeriodo, RoomRound } from "../types/customRoom";
import { computeRoomRanking } from "./customRoomStats";
import { getNextRankingResetAt } from "./customRoomRankingPeriod";

export type RoomModoConfig = { modo: string; rodadas: number };

export type RoomSettingsPayload = {
  userId: string;
  nome?: string;
  modos?: RoomModoConfig[];
  rankingPeriodo?: RankingPeriodo;
  kickMemberId?: string;
};

export function normalizeRoomModos(room: CustomRoom): RoomModoConfig[] {
  if (room.modos?.length) {
    return room.modos.map((entry) => ({
      modo: entry.modo,
      rodadas: Math.max(0, entry.rodadas),
    }));
  }

  const counts = (room.rodadas ?? []).reduce<Record<string, number>>((acc, round) => {
    const modo = round.modo || room.modo || "casual";
    acc[modo] = (acc[modo] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([modo, rodadas]) => ({ modo, rodadas }));
}

export function validateRoomName(nome: string): string {
  const trimmed = nome.trim();
  if (!trimmed) throw new Error("Digite um nome para a sala.");
  if (trimmed.length > 20) throw new Error("O nome da sala pode ter no máximo 20 caracteres.");
  return trimmed;
}

export function validateRoomModos(modos: RoomModoConfig[]): RoomModoConfig[] {
  const sanitized = modos
    .map((entry) => ({
      modo: entry.modo,
      rodadas: Math.max(0, Math.floor(entry.rodadas)),
    }))
    .filter((entry) => entry.rodadas > 0);

  if (sanitized.length === 0) {
    throw new Error("A sala precisa ter pelo menos um modo com uma rodada.");
  }

  const total = sanitized.reduce((sum, entry) => sum + entry.rodadas, 0);
  if (total > 60) {
    throw new Error("A sala pode ter no máximo 60 rodadas no total.");
  }

  return sanitized;
}

export function rebuildRodadaModoHistorico(room: CustomRoom): Record<string, string> {
  const historico: Record<string, string> = {
    ...(room.rodadaModoHistorico ?? {}),
  };

  for (const round of room.rodadas ?? []) {
    historico[String(round.rodada)] = round.modo || room.modo || "casual";
  }

  return historico;
}

export function syncRodadasWithModos(
  room: CustomRoom,
  modosInput: RoomModoConfig[]
): Pick<CustomRoom, "modos" | "rodadas" | "modo" | "rodadaModoHistorico" | "ranking"> {
  const modos = validateRoomModos(modosInput);
  const historico = rebuildRodadaModoHistorico(room);
  const existingRodadas = [...(room.rodadas ?? [])];

  const byModo = new Map<string, RoomRound[]>();
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

  const rodadas: RoomRound[] = [];

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

  const roomWithHistorico: CustomRoom = {
    ...room,
    rodadas,
    rodadaModoHistorico: historico,
  };

  return {
    modos,
    rodadas,
    modo: modos[0]?.modo ?? room.modo,
    rodadaModoHistorico: historico,
    ranking: computeRoomRanking(room.membros ?? [], rodadas, roomWithHistorico),
  };
}

export function applyModosUpdate(
  room: CustomRoom,
  modosInput: RoomModoConfig[]
): Pick<
  CustomRoom,
  "modos" | "rodadas" | "modo" | "rodadaModoHistorico" | "membros" | "ranking"
> {
  const synced = syncRodadasWithModos(room, modosInput);

  return {
    ...synced,
    membros: room.membros,
  };
}

export function applyRankingPeriodoUpdate(
  room: CustomRoom,
  rankingPeriodo: RankingPeriodo
): Pick<CustomRoom, "rankingPeriodo" | "rankingResetEm"> {
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

export function applyKickMember(
  room: CustomRoom,
  memberId: string,
  ownerId: string
): Pick<CustomRoom, "membros" | "progressoRemovidos" | "ranking"> {
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

export function applyRoomSettings(
  room: CustomRoom,
  payload: RoomSettingsPayload
): CustomRoom {
  if (room.ownerId !== payload.userId) {
    throw new Error("Somente o anfitrião pode alterar as configurações da sala.");
  }

  let next: CustomRoom = { ...room };

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
