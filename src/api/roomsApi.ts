import type { CustomRoom } from "../types/customRoom";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const roomsApi = {
  getRoom(id: string) {
    return request<CustomRoom | null>(`/rooms/${encodeURIComponent(id)}`);
  },

  roomExists(id: string) {
    return request<{ exists: boolean }>(
      `/rooms/${encodeURIComponent(id)}/exists`
    ).then((result) => result.exists);
  },

  createRoom(room: CustomRoom) {
    return request<{ ok: boolean; id: string }>("/rooms", {
      method: "POST",
      body: JSON.stringify(room),
    });
  },

  patchRoom(id: string, patch: Partial<CustomRoom>) {
    return request<{ ok: boolean }>(`/rooms/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  deleteRoom(id: string) {
    return request<{ ok: boolean }>(`/rooms/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  listPermanentRooms() {
    return request<PermanentRoomSummary[]>("/rooms?type=permanente");
  },

  getChatMessages(roomId: string) {
    return request<RoomMessageDto[]>(
      `/rooms/${encodeURIComponent(roomId)}/chat`
    );
  },

  sendChatMessage(
    roomId: string,
    payload: { userId: string; userName: string; text: string }
  ) {
    return request<{ ok: boolean }>(
      `/rooms/${encodeURIComponent(roomId)}/chat`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
