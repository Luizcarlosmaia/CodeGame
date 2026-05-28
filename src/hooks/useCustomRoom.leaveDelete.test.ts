import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCustomRoom } from "./useCustomRoom";
import { roomsApi } from "../api/roomsApi";
import {
  isRoomAccessGranted,
  markRoomAccessGranted,
} from "../utils/customRoomAccess";
import type { CustomRoom } from "../types/customRoom";

vi.mock("../api/roomsApi", () => ({
  roomsApi: {
    getRoom: vi.fn(),
    patchRoom: vi.fn(),
    deleteRoom: vi.fn(),
  },
}));

const roomId = "SALA-LEAVE";

const baseRoom: CustomRoom = {
  id: roomId,
  nome: "Sala Teste",
  type: "permanente",
  ownerId: "owner1",
  admins: ["owner1"],
  membros: [
    {
      id: "owner1",
      nome: "Dono",
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    },
    {
      id: "guest1",
      nome: "Convidado",
      terminouRodada: true,
      tentativas: [2],
      progresso: [
        {
          rodada: 1,
          data: "20260528",
          tentativas: 2,
          terminou: true,
          win: true,
        },
      ],
    },
  ],
  modo: "casual",
  rodadaAtual: 1,
  rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
  ranking: [],
  aberta: true,
  criadaEm: "2026-05-27T12:00:00.000Z",
  progressoRemovidos: [],
};

describe("useCustomRoom — abandonar sala", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(`customRoomUserId_${roomId}`, "guest1");
    markRoomAccessGranted(roomId);
    vi.mocked(roomsApi.getRoom).mockResolvedValue(JSON.parse(JSON.stringify(baseRoom)));
    vi.mocked(roomsApi.patchRoom).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("remove membro, arquiva progresso e limpa dados locais ao abandonar", async () => {
    const { result } = renderHook(() => useCustomRoom(roomId));

    let response: boolean | "not_found" | undefined;
    await act(async () => {
      response = await result.current.leaveRoom(roomId, "guest1", true);
    });

    expect(response).toBe(true);
    expect(roomsApi.patchRoom).toHaveBeenCalledWith(
      roomId,
      expect.objectContaining({
        membros: [baseRoom.membros[0]],
        progressoRemovidos: [
          {
            id: "guest1",
            progresso: baseRoom.membros[1].progresso,
          },
        ],
      })
    );
    expect(localStorage.getItem(`customRoomUserId_${roomId}`)).toBeNull();
    expect(isRoomAccessGranted(roomId)).toBe(false);
  });

  it("impede anfitrião de abandonar sem excluir ou transferir", async () => {
    const { result } = renderHook(() => useCustomRoom(roomId));

    let response: boolean | "not_found" | undefined;
    await act(async () => {
      response = await result.current.leaveRoom(roomId, "owner1", true);
    });

    expect(response).toBe(false);
    expect(roomsApi.patchRoom).not.toHaveBeenCalled();
  });

  it("retorna not_found quando usuário não está na sala", async () => {
    const { result } = renderHook(() => useCustomRoom(roomId));

    let response: boolean | "not_found" | undefined;
    await act(async () => {
      response = await result.current.leaveRoom(roomId, "intruso", true);
    });

    expect(response).toBe("not_found");
    expect(roomsApi.patchRoom).not.toHaveBeenCalled();
  });

  it("não limpa localStorage quando abandonar é false", async () => {
    const { result } = renderHook(() => useCustomRoom(roomId));

    await act(async () => {
      await result.current.leaveRoom(roomId, "guest1", false);
    });

    expect(localStorage.getItem(`customRoomUserId_${roomId}`)).toBe("guest1");
    expect(isRoomAccessGranted(roomId)).toBe(true);
  });
});

describe("useCustomRoom — excluir sala", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(`customRoomUserId_${roomId}`, "owner1");
    markRoomAccessGranted(roomId);
    vi.mocked(roomsApi.deleteRoom).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("chama API delete e limpa dados locais", async () => {
    const { result } = renderHook(() => useCustomRoom(roomId));

    let response: boolean | undefined;
    await act(async () => {
      response = await result.current.deleteRoom(roomId);
    });

    expect(response).toBe(true);
    expect(roomsApi.deleteRoom).toHaveBeenCalledWith(roomId);
    expect(localStorage.getItem(`customRoomUserId_${roomId}`)).toBeNull();
    expect(isRoomAccessGranted(roomId)).toBe(false);
  });

  it("retorna false quando a API falha", async () => {
    vi.mocked(roomsApi.deleteRoom).mockRejectedValue(new Error("Falha na rede"));
    const { result } = renderHook(() => useCustomRoom(roomId));

    let response: boolean | undefined;
    await act(async () => {
      response = await result.current.deleteRoom(roomId);
    });

    expect(response).toBe(false);
    expect(localStorage.getItem(`customRoomUserId_${roomId}`)).toBe("owner1");
    expect(isRoomAccessGranted(roomId)).toBe(true);
  });
});

describe("useCustomRoom — permissões do anfitrião", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(roomsApi.getRoom).mockResolvedValue(JSON.parse(JSON.stringify(baseRoom)));
    vi.mocked(roomsApi.patchRoom).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("impede transferência de anfitrião por participante", async () => {
    const { result } = renderHook(() => useCustomRoom(roomId));

    let response: boolean | undefined;
    await act(async () => {
      response = await result.current.transferOwnership(roomId, "guest1", "owner1");
    });

    expect(response).toBe(false);
    expect(roomsApi.patchRoom).not.toHaveBeenCalled();
  });
});
