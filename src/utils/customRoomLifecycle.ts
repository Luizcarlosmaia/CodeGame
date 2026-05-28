import type { CustomRoom, RoomPlayer, RoomType } from "../types/customRoom";

export const TEMPORARY_ROOM_TTL_MS = 5 * 60 * 60 * 1000;

export type RankingPeriodo = "nunca" | "semanal" | "mensal";

export function isRoomType(value: string | undefined): value is RoomType {
  return value === "permanente" || value === "temporaria";
}

export function getTemporaryRoomExpiresAt(from = new Date()): string {
  return new Date(from.getTime() + TEMPORARY_ROOM_TTL_MS).toISOString();
}

export function isTemporaryRoom(room: Pick<CustomRoom, "type">): boolean {
  return room.type === "temporaria";
}

export function isTemporaryRoomExpired(
  room: Pick<CustomRoom, "type" | "expiraEm" | "aberta">,
  now = Date.now()
): boolean {
  if (!isTemporaryRoom(room) || !room.expiraEm) return false;
  return new Date(room.expiraEm).getTime() <= now;
}

export function applyTemporaryRoomExpiry<T extends CustomRoom>(room: T): T {
  if (!isTemporaryRoomExpired(room)) return room;

  if (room.aberta === false && room.expiradaEm) return room;

  return {
    ...room,
    aberta: false,
    expiradaEm: room.expiradaEm ?? new Date().toISOString(),
  };
}

export function isRoomPlayable(room: CustomRoom | null | undefined): boolean {
  if (!room || !isRoomType(room.type)) return false;
  if (room.aberta === false) return false;
  if (isTemporaryRoomExpired(room)) return false;
  return true;
}

export function formatExpiryCountdown(
  expiraEm: string,
  now = Date.now()
): string {
  const diffMs = new Date(expiraEm).getTime() - now;
  if (diffMs <= 0) return "Expirada";

  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function buildNewMatchPatch(
  room: CustomRoom,
  ownerId: string
): Partial<CustomRoom> {
  if (room.ownerId !== ownerId) {
    throw new Error("Somente o anfitrião pode iniciar uma nova partida.");
  }

  if (!isTemporaryRoom(room)) {
    throw new Error("Nova partida está disponível apenas em salas temporárias.");
  }

  if (isTemporaryRoomExpired(room)) {
    throw new Error("Esta sala já expirou.");
  }

  const membros: RoomPlayer[] = (room.membros ?? []).map((member) => ({
    ...member,
    terminouRodada: false,
    tentativas: [],
    progresso: [],
  }));

  return {
    membros,
    ranking: [],
    progressoRemovidos: [],
    partidaNumero: (room.partidaNumero ?? 1) + 1,
    aberta: true,
    rodadaAtual: 1,
    rodadas: (room.rodadas ?? []).map((rodada) => ({
      ...rodada,
      encerrada: false,
      inicio: "",
      fim: undefined,
    })),
  };
}
