import type { CustomRoom } from "../types/customRoom";

export const ROOM_ACCESS_GRANTED_PREFIX = "customRoomAccessGranted_";

export function isRoomMember(
  room: CustomRoom | null | undefined,
  userId: string
): boolean {
  if (!room || !userId) return false;
  return (room.membros ?? []).some((member) => member.id === userId);
}

export function markRoomAccessGranted(roomId: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.setItem(`${ROOM_ACCESS_GRANTED_PREFIX}${roomId}`, "1");
}

export function isRoomAccessGranted(roomId: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return localStorage.getItem(`${ROOM_ACCESS_GRANTED_PREFIX}${roomId}`) === "1";
}

export function clearRoomAccessGranted(roomId: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  localStorage.removeItem(`${ROOM_ACCESS_GRANTED_PREFIX}${roomId}`);
}

/** Sala protegida: exige entrar pela tela com código + nome (não só link direto). */
export function canAccessProtectedRoom(
  room: CustomRoom | null | undefined,
  userId: string,
  roomId: string
): boolean {
  if (!roomId || !userId) return false;
  if (!isRoomAccessGranted(roomId)) return false;
  return isRoomMember(room, userId);
}

export function getProtectedRoomEntryPath(roomId: string): string {
  const code = encodeURIComponent(roomId);
  return `/custom/entrar?codigo=${code}`;
}
