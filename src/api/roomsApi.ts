import type { CustomRoom } from "../types/customRoom";
import type { RoomSettingsPayload } from "../utils/customRoomSettings";
import { apiRequest } from "./apiClient";

type PermanentRoomSummary = {
  id: string;
  nome: string;
  modos?: { modo: string; rodadas: number }[];
  aberta?: boolean;
  membros?: CustomRoom["membros"];
};

export type RoomMessageDto = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

export const roomsApi = {
  getRoom(id: string) {
    return apiRequest<CustomRoom | null>(`/rooms/${encodeURIComponent(id)}`);
  },

  roomExists(id: string) {
    return apiRequest<{ exists: boolean }>(
      `/rooms/${encodeURIComponent(id)}/exists`
    ).then((result) => result.exists);
  },

  createRoom(room: CustomRoom) {
    return apiRequest<{ ok: boolean; id: string }>("/rooms", {
      method: "POST",
      body: JSON.stringify(room),
    });
  },

  patchRoom(id: string, patch: Partial<CustomRoom>) {
    return apiRequest<{ ok: boolean }>(`/rooms/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  deleteRoom(id: string) {
    return apiRequest<{ ok: boolean }>(`/rooms/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  listPermanentRooms() {
    return apiRequest<PermanentRoomSummary[]>("/rooms?type=permanente");
  },

  getChatMessages(roomId: string) {
    return apiRequest<RoomMessageDto[]>(
      `/rooms/${encodeURIComponent(roomId)}/chat`
    );
  },

  sendChatMessage(
    roomId: string,
    payload: { userId: string; userName: string; text: string }
  ) {
    return apiRequest<{ ok: boolean }>(
      `/rooms/${encodeURIComponent(roomId)}/chat`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  startNewMatch(roomId: string, userId: string) {
    return apiRequest<{ ok: boolean; room: CustomRoom }>(
      `/rooms/${encodeURIComponent(roomId)}/nova-partida`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );
  },

  updateRoomSettings(roomId: string, payload: RoomSettingsPayload) {
    return apiRequest<{ ok: boolean; room: CustomRoom }>(
      `/rooms/${encodeURIComponent(roomId)}/settings`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  cleanupExpiredRooms(secret?: string) {
    const query = secret ? `?secret=${encodeURIComponent(secret)}` : "";
    return apiRequest<{ ok: boolean; deleted: number; ids: string[] }>(
      `/rooms/cleanup-expired${query}`,
      { method: "POST" }
    );
  },

  transferOwnership(roomId: string, userId: string, targetMemberId: string) {
    return apiRequest<{ ok: boolean; room: CustomRoom }>(
      `/rooms/${encodeURIComponent(roomId)}/transfer`,
      {
        method: "POST",
        body: JSON.stringify({ userId, targetMemberId }),
      }
    );
  },

  validateResume(roomId: string, memberId: string, token: string) {
    return apiRequest<{
      ok: boolean;
      memberId: string;
      memberName: string;
      roomId: string;
    }>(`/rooms/${encodeURIComponent(roomId)}/resume`, {
      method: "POST",
      body: JSON.stringify({ memberId, token }),
    });
  },

  createGuestResumeLink(roomId: string, hostUserId: string, memberId: string) {
    return apiRequest<{
      ok: boolean;
      memberId: string;
      resumeToken: string;
    }>(
      `/rooms/${encodeURIComponent(roomId)}/members/${encodeURIComponent(memberId)}/resume-link`,
      {
        method: "POST",
        body: JSON.stringify({ userId: hostUserId }),
      }
    );
  },
};
