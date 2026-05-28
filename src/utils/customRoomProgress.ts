import type { CustomRoom, RoomPlayer } from "../types/customRoom";
import { todayKey } from "./stats";

type RoomProgressScope = Pick<CustomRoom, "type" | "partidaNumero">;

export function getCustomRoomProgressKey(room: RoomProgressScope): string {
  if (room.type === "temporaria") {
    return `p${room.partidaNumero ?? 1}`;
  }
  return todayKey();
}

export function isLegacyTemporaryProgressKey(data: string): boolean {
  return !data.startsWith("p");
}

export function findRoundProgress(
  player: RoomPlayer | undefined,
  rodada: number,
  room: RoomProgressScope
): NonNullable<RoomPlayer["progresso"]>[number] | undefined {
  if (!player?.progresso?.length) return undefined;

  const key = getCustomRoomProgressKey(room);
  const exact = player.progresso.find(
    (entry) => entry.rodada === rodada && entry.data === key
  );
  if (exact) return exact;

  if (room.type === "temporaria") {
    return player.progresso.find((entry) => entry.rodada === rodada);
  }

  return undefined;
}

/** Chave usada no seed do código — mantém compatível com progresso legado. */
export function getCustomRoomCodeSessionKey(
  room: RoomProgressScope,
  player: RoomPlayer | undefined,
  rodada: number
): string {
  if (room.type !== "temporaria") return todayKey();

  const progress = findRoundProgress(player, rodada, room);
  if (progress?.data && isLegacyTemporaryProgressKey(progress.data)) {
    return progress.data;
  }

  return getCustomRoomProgressKey(room);
}

export function filterProgressForRoom(
  progresso: RoomPlayer["progresso"] | undefined,
  room: RoomProgressScope
): NonNullable<RoomPlayer["progresso"]> {
  if (!progresso?.length) return [];

  if (room.type === "permanente") {
    return progresso;
  }

  const key = getCustomRoomProgressKey(room);
  const keyed = progresso.filter((entry) => entry.data === key);
  if (keyed.length > 0 || room.type !== "temporaria") return keyed;

  return progresso.filter((entry) => isLegacyTemporaryProgressKey(entry.data));
}

export function removeRoundProgressEntries(
  progresso: NonNullable<RoomPlayer["progresso"]>,
  rodada: number,
  room: RoomProgressScope
): NonNullable<RoomPlayer["progresso"]> {
  if (room.type === "temporaria") {
    return progresso.filter((entry) => entry.rodada !== rodada);
  }

  const key = getCustomRoomProgressKey(room);
  return progresso.filter(
    (entry) => !(entry.rodada === rodada && entry.data === key)
  );
}
