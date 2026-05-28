import { vi } from "vitest";
import type { CustomRoom } from "../types/customRoom";

export function createUseCustomRoomMock(
  room: CustomRoom | null,
  overrides: Record<string, unknown> = {}
) {
  return {
    room,
    setRoom: vi.fn(),
    loading: false,
    error: null,
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    deleteRoom: vi.fn(),
    transferOwnership: vi.fn(),
    startNewMatch: vi.fn(),
    updateRoomSettings: vi.fn(),
    ...overrides,
  };
}