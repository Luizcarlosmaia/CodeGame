import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomRoomLobby from "./CustomRoomLobby";
import * as useCustomRoomModule from "../../hooks/useCustomRoom";
import { createCustomRoom } from "../../test/customRoomFixtures";

vi.mock("./CustomRoomChat", () => ({
  default: () => <div data-testid="custom-room-chat" />,
}));

function renderLobby(room: ReturnType<typeof createCustomRoom>, userId: string) {
  return render(
    <BrowserRouter>
      <CustomRoomLobby
        roomId={room.id}
        userId={userId}
        userName="Participante"
      />
    </BrowserRouter>
  );
}

describe.each([10, 15, 20])("CustomRoomLobby com %i jogadores", (memberCount) => {
  beforeEach(() => {
    vi.spyOn(useCustomRoomModule, "useCustomRoom").mockImplementation(() => ({
      room: createCustomRoom(memberCount),
      setRoom: vi.fn(),
      loading: false,
      error: null,
      createRoom: vi.fn(),
      joinRoom: vi.fn(),
      leaveRoom: vi.fn(),
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
      deleteRoom: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exibe contagem e lista completa de membros", () => {
    const room = createCustomRoom(memberCount);
    const { container } = renderLobby(room, room.membros[1].id);

    const jogadoresPill = container.querySelectorAll(".custom-lobby-stat-pill")[0];
    expect(jogadoresPill).toHaveTextContent(String(memberCount));
    expect(jogadoresPill).toHaveTextContent("Jogadores");
    expect(container.querySelectorAll(".custom-lobby-member-row")).toHaveLength(
      memberCount
    );
  });
});
