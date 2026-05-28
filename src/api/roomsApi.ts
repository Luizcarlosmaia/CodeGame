import type { CustomRoom } from "../types/customRoom";
import type { RoomSettingsPayload } from "../utils/customRoomSettings";

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

  const raw = await response.text();
  let payload: unknown = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      if (raw.trimStart().startsWith("<!DOCTYPE") || raw.trimStart().startsWith("<html")) {
        throw new Error(
          "API indisponível. Reinicie o app com npm run dev (servidor local + Vite)."
        );
      }
      throw new Error("Resposta inválida da API.");
    }
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error?: string }).error === "string"
        ? (payload as { error: string }).error
        : response.status === 404 && path.includes("/settings")
          ? "Rota de configurações indisponível. Reinicie com npm run dev (feche processos na porta 3001)."
          : response.statusText;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return payload as T;
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

  startNewMatch(roomId: string, userId: string) {
    return request<{ ok: boolean; room: CustomRoom }>(
      `/rooms/${encodeURIComponent(roomId)}/nova-partida`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );
  },

  updateRoomSettings(roomId: string, payload: RoomSettingsPayload) {
    return request<{ ok: boolean; room: CustomRoom }>(
      `/rooms/${encodeURIComponent(roomId)}/settings`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  cleanupExpiredRooms(secret?: string) {
    const query = secret ? `?secret=${encodeURIComponent(secret)}` : "";
    return request<{ ok: boolean; deleted: number; ids: string[] }>(
      `/rooms/cleanup-expired${query}`,
      { method: "POST" }
    );
  },
};
