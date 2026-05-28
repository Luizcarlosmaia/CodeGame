import type { CustomRoom, RoomPlayer, RoomRanking } from "../types/customRoom";
import { getModeMaxTries, isCustomRoomMode } from "./modeLabels";
import { filterProgressForRoom } from "./customRoomProgress";

export interface RoundConfig {
  rodada: number;
  modo?: string;
}

type RoomProgressScope = Pick<
  CustomRoom,
  "type" | "partidaNumero" | "rodadaModoHistorico"
>;

export function computeRoundScore(
  modo: string,
  tentativas: number,
  win: boolean
): number {
  if (!win || tentativas <= 0) return 0;

  const maxTries = isCustomRoomMode(modo) ? getModeMaxTries(modo) : 15;
  const clampedTentativas = Math.min(Math.max(tentativas, 1), maxTries);

  return maxTries - clampedTentativas + 1;
}

export function getModoForRodada(
  rodada: number,
  rodadas: RoundConfig[],
  room?: RoomProgressScope
): string {
  const active = rodadas.find((round) => round.rodada === rodada)?.modo;
  if (active) return active || "casual";
  return room?.rodadaModoHistorico?.[String(rodada)] || "casual";
}

export function computePlayerTotalScore(
  member: RoomPlayer,
  rodadas: RoundConfig[],
  room?: RoomProgressScope
): number {
  const progressEntries = room
    ? filterProgressForRoom(member.progresso, room)
    : member.progresso;

  if (!Array.isArray(progressEntries) || progressEntries.length === 0) {
    return 0;
  }

  return progressEntries.reduce((total, entry) => {
    if (!entry.terminou) return total;

    const modo = getModoForRodada(entry.rodada, rodadas, room);
    return total + computeRoundScore(modo, entry.tentativas, !!entry.win);
  }, 0);
}

export function computeRoomRanking(
  membros: RoomPlayer[],
  rodadas: RoundConfig[],
  room?: RoomProgressScope
): RoomRanking[] {
  const ranking = membros.map((member) => ({
    playerId: member.id,
    nome: member.nome,
    pontos: computePlayerTotalScore(member, rodadas, room),
  }));

  ranking.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  return ranking;
}

export interface PlayerPlayStats {
  dias: number;
  vezesJogadas: number;
}

export function getPlayerPlayStats(
  progresso?: RoomPlayer["progresso"],
  room?: RoomProgressScope
): PlayerPlayStats {
  const entries = room ? filterProgressForRoom(progresso, room) : progresso;

  if (!Array.isArray(entries) || entries.length === 0) {
    return { dias: 0, vezesJogadas: 0 };
  }

  const finished = entries.filter((entry) => entry.terminou);
  const dias = new Set(finished.map((entry) => entry.data)).size;

  return {
    dias,
    vezesJogadas: finished.length,
  };
}

export function hasPlayedAtLeastOnce(
  progresso?: RoomPlayer["progresso"],
  room?: RoomProgressScope
): boolean {
  const entries = room ? filterProgressForRoom(progresso, room) : progresso;
  if (!Array.isArray(entries) || entries.length === 0) return false;
  return entries.some((entry) => entry.terminou || entry.tentativas > 0);
}

export function filterRankingByPlayed(
  ranking: RoomRanking[],
  membros: RoomPlayer[],
  room?: RoomProgressScope
): RoomRanking[] {
  if (!Array.isArray(ranking)) return [];

  return ranking.filter((entry) => {
    const member = membros.find((player) => player.id === entry.playerId);
    return hasPlayedAtLeastOnce(member?.progresso, room);
  });
}

export function getRoomAgeDays(criadaEm: string, now = new Date()): number {
  const created = new Date(criadaEm);
  if (Number.isNaN(created.getTime())) return 0;

  return Math.max(
    0,
    Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function formatRoomLifetime(criadaEm: string, now = new Date()): string {
  const created = new Date(criadaEm);
  if (Number.isNaN(created.getTime())) return "";

  const diffMs = Math.max(0, now.getTime() - created.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours <= 0) return "Sala criada hoje";
    return diffHours === 1 ? "Sala ativa há 1 hora" : `Sala ativa há ${diffHours} horas`;
  }

  if (diffDays === 1) return "Sala ativa há 1 dia";
  return `Sala ativa há ${diffDays} dias`;
}

export function formatPlayerPlayStats(stats: PlayerPlayStats): string {
  const diasLabel = stats.dias === 1 ? "1 dia" : `${stats.dias} dias`;
  const jogosLabel =
    stats.vezesJogadas === 1 ? "1 jogo" : `${stats.vezesJogadas} jogos`;

  return `${diasLabel} · ${jogosLabel}`;
}
