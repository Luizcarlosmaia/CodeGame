import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { roomsApi } from "../api/roomsApi";
import { useCustomRoom } from "../hooks/useCustomRoom";
import { applyKickMember } from "./customRoomSettings";
import {
  computeRoomRanking,
  filterRankingByPlayed,
} from "./customRoomStats";
import {
  createCustomRoom,
  createRoomMembers,
} from "../test/customRoomFixtures";

vi.mock("../api/roomsApi", () => ({
  roomsApi: {
    getRoom: vi.fn(),
    patchRoom: vi.fn(),
  },
}));

const MEMBER_COUNTS = [10, 15, 20] as const;

describe.each(MEMBER_COUNTS)("sala com %i jogadores", (memberCount) => {
  it("mantém membros únicos e ranking ordenado", () => {
    const room = createCustomRoom(memberCount);
    const ids = room.membros.map((member) => member.id);

    expect(room.membros).toHaveLength(memberCount);
    expect(new Set(ids).size).toBe(memberCount);

    const ranking = computeRoomRanking(room.membros, room.rodadas ?? [], room);
    expect(ranking).toHaveLength(memberCount);

    for (let index = 1; index < ranking.length; index++) {
      expect(ranking[index - 1].pontos).toBeGreaterThanOrEqual(
        ranking[index].pontos
      );
    }

    const playedRanking = filterRankingByPlayed(ranking, room.membros, {
      type: "permanente",
    });
    expect(playedRanking.length).toBe(memberCount - 1);
  });

  it("expulsa um jogador e recalcula o ranking", () => {
    const room = createCustomRoom(memberCount);
    const target = room.membros[memberCount - 1];

    const patch = applyKickMember(room, target.id, room.ownerId);

    expect(patch.membros).toHaveLength(memberCount - 1);
    expect(patch.membros?.some((member) => member.id === target.id)).toBe(false);
    expect(patch.ranking).toHaveLength(memberCount - 1);
    expect(
      patch.progressoRemovidos?.some((entry) => entry.id === target.id)
    ).toBe(true);
  });
});

describe.each(MEMBER_COUNTS)("entrada sequencial com %i jogadores", (targetCount) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("joinRoom adiciona jogadores até o total da sala", async () => {
    let room = createCustomRoom(1);

    vi.mocked(roomsApi.getRoom).mockImplementation(async () => room);
    vi.mocked(roomsApi.patchRoom).mockImplementation(async (_id, patch) => {
      room = { ...room, ...patch };
      return { ok: true };
    });

    const { result } = renderHook(() => useCustomRoom(room.id));

    for (let index = 2; index <= targetCount; index++) {
      let joinResult: unknown;

      await act(async () => {
        joinResult = await result.current.joinRoom(room.id, {
          id: `player-${index}`,
          nome: `Jogador ${index}`,
          terminouRodada: false,
          tentativas: [],
        });
      });

      expect(joinResult).toBe(true);
      expect(room.membros).toHaveLength(index);
    }

    expect(room.membros).toHaveLength(targetCount);
    expect(new Set(room.membros.map((member) => member.id)).size).toBe(
      targetCount
    );
  });

  it("joinRoom não duplica jogador já presente", async () => {
    const membros = createRoomMembers(targetCount);
    let room = createCustomRoom(targetCount, { membros });

    vi.mocked(roomsApi.getRoom).mockImplementation(async () => room);
    vi.mocked(roomsApi.patchRoom).mockImplementation(async (_id, patch) => {
      room = { ...room, ...patch };
      return { ok: true };
    });

    const { result } = renderHook(() => useCustomRoom(room.id));

    let joinResult: unknown;
    await act(async () => {
      joinResult = await result.current.joinRoom(room.id, {
        id: membros[1].id,
        nome: membros[1].nome,
        terminouRodada: false,
        tentativas: [],
      });
    });

    expect(joinResult).toBe("already_joined");
    expect(room.membros).toHaveLength(targetCount);
    expect(roomsApi.patchRoom).not.toHaveBeenCalled();
  });
});
