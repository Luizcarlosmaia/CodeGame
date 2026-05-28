import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchMyCustomRooms,
  getStoredCustomRoomIds,
} from "./customRoomStorage";
import { isRoomAccessGranted } from "./customRoomAccess";
import { roomsApi } from "../api/roomsApi";
import type { CustomRoom } from "../types/customRoom";

const activeRoom: CustomRoom = {
  id: "TEMP123",
  nome: "Noite dos amigos",
  type: "temporaria",
  ownerId: "user-abc",
  admins: ["user-abc"],
  membros: [{ id: "user-abc", nome: "Eu", terminouRodada: false, tentativas: [] }],
  modo: "casual",
  rodadaAtual: 1,
  rodadas: [],
  ranking: [],
  aberta: true,
  criadaEm: "2026-05-27T10:00:00.000Z",
  expiraEm: "2099-01-01T00:00:00.000Z",
};

describe("customRoomStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lista ids salvos no localStorage", () => {
    localStorage.setItem("customRoomUserId_ABC", "user1");
    localStorage.setItem("customRoomUserId_XYZ", "user2");
    localStorage.setItem("customRoomUserName", "João");

    expect(getStoredCustomRoomIds().sort()).toEqual(["ABC", "XYZ"]);
  });

  it("fetchMyCustomRooms inclui temporárias ativas", async () => {
    localStorage.setItem("customRoomUserId_TEMP123", "user-abc");
    vi.spyOn(roomsApi, "getRoom").mockResolvedValue(activeRoom);

    const rooms = await fetchMyCustomRooms();

    expect(rooms).toHaveLength(1);
    expect(rooms[0].id).toBe("TEMP123");
    expect(rooms[0].type).toBe("temporaria");
    expect(isRoomAccessGranted("TEMP123")).toBe(true);
  });

  it("fetchMyCustomRooms ignora salas expiradas", async () => {
    localStorage.setItem("customRoomUserId_TEMP123", "user-abc");
    vi.spyOn(roomsApi, "getRoom").mockResolvedValue({
      ...activeRoom,
      aberta: false,
      expiradaEm: "2026-05-27T16:00:00.000Z",
    });

    const rooms = await fetchMyCustomRooms();
    expect(rooms).toHaveLength(0);
  });
});
