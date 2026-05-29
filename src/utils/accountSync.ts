import { authApi } from "../api/authApi";
import { getStoredCustomRoomIds, getStoredUserIdForRoom } from "./customRoomStorage";
import { roomsApi } from "../api/roomsApi";

const SYNC_FLAG = "cg_custom_sync_done";

async function collectRoomMemberships(): Promise<
  Array<{ roomId: string; memberId: string; role: "owner" | "member" }>
> {
  const roomIds = getStoredCustomRoomIds();
  const memberships: Array<{
    roomId: string;
    memberId: string;
    role: "owner" | "member";
  }> = [];

  const results = await Promise.all(
    roomIds.map(async (roomId) => {
      const memberId = getStoredUserIdForRoom(roomId);
      if (!memberId) return null;
      const room = await roomsApi.getRoom(roomId).catch(() => null);
      if (!room) return null;
      if (!(room.membros ?? []).some((m) => m.id === memberId)) return null;
      const role: "owner" | "member" =
        room.ownerId === memberId ? "owner" : "member";
      return { roomId, memberId, role };
    })
  );

  for (const entry of results) {
    if (entry) memberships.push(entry);
  }

  return memberships;
}

/** Vincula salas custom do localStorage à conta (não inclui desafios diários). */
export async function syncLocalStorageToAccount(
  userId: string,
  force = false
): Promise<void> {
  if (typeof window === "undefined") return;

  const flagKey = `${SYNC_FLAG}_${userId}`;
  if (!force && localStorage.getItem(flagKey) === "1") return;

  const displayName = localStorage.getItem("customRoomUserName") || undefined;
  const roomMemberships = await collectRoomMemberships();

  await authApi.syncLocal({
    displayName: displayName && displayName !== "Visitante" ? displayName : undefined,
    roomMemberships,
  });

  localStorage.setItem(flagKey, "1");
}
