import { roomsApi } from "../api/roomsApi";
import type { CustomRoom } from "../types/customRoom";
import { isRoomPlayable } from "./customRoomLifecycle";

const USER_ID_PREFIX = "customRoomUserId_";

export function getStoredCustomRoomIds(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];

  const ids: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(USER_ID_PREFIX)) {
      ids.push(key.slice(USER_ID_PREFIX.length));
    }
  }

  return [...new Set(ids)];
}

export function getStoredUserIdForRoom(roomId: string): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(`${USER_ID_PREFIX}${roomId}`);
}

/** Salas deste dispositivo em que o usuário ainda é membro e a sala está ativa. */
export async function fetchMyCustomRooms(): Promise<CustomRoom[]> {
  const roomIds = getStoredCustomRoomIds();
  if (roomIds.length === 0) return [];

  const results = await Promise.all(
    roomIds.map((id) => roomsApi.getRoom(id).catch(() => null))
  );

  return results
    .filter((room): room is CustomRoom => room !== null)
    .filter((room) => {
      const userId = getStoredUserIdForRoom(room.id);
      if (!userId) return false;
      if (!isRoomPlayable(room)) return false;
      return (room.membros ?? []).some((member) => member.id === userId);
    });
}
