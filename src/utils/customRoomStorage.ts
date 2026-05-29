import { authApi } from "../api/authApi";
import { getAuthToken } from "../api/apiClient";
import { roomsApi } from "../api/roomsApi";
import type { CustomRoom } from "../types/customRoom";
import { markRoomAccessGranted } from "./customRoomAccess";
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

async function fetchMyRoomsFromLocalStorage(): Promise<CustomRoom[]> {
  const roomIds = getStoredCustomRoomIds();
  if (roomIds.length === 0) return [];

  const results = await Promise.all(
    roomIds.map((id) => roomsApi.getRoom(id).catch(() => null))
  );

  const rooms = results
    .filter((room): room is CustomRoom => room !== null)
    .filter((room) => {
      const userId = getStoredUserIdForRoom(room.id);
      if (!userId) return false;
      if (!isRoomPlayable(room)) return false;
      return (room.membros ?? []).some((member) => member.id === userId);
    });

  for (const room of rooms) {
    markRoomAccessGranted(room.id);
  }

  return rooms;
}

type AccountRoomSummary = CustomRoom & {
  inRoomMemberId?: string;
  membershipRole?: string;
};

async function fetchMyRoomsFromAccount(): Promise<CustomRoom[]> {
  const apiRooms = (await authApi.getMyRooms()) as AccountRoomSummary[];
  const rooms: CustomRoom[] = [];

  for (const entry of apiRooms) {
    if (!isRoomPlayable(entry)) continue;

    const memberId = entry.inRoomMemberId ?? getStoredUserIdForRoom(entry.id);
    if (!memberId) continue;
    if (!(entry.membros ?? []).some((m) => m.id === memberId)) continue;

    localStorage.setItem(`${USER_ID_PREFIX}${entry.id}`, memberId);
    markRoomAccessGranted(entry.id);
    rooms.push(entry);
  }

  return rooms;
}

/** Salas ativas do usuário (conta logada ou localStorage como visitante). */
export async function fetchMyCustomRooms(): Promise<CustomRoom[]> {
  if (getAuthToken()) {
    try {
      return await fetchMyRoomsFromAccount();
    } catch {
      // fallback para localStorage
    }
  }

  return fetchMyRoomsFromLocalStorage();
}
