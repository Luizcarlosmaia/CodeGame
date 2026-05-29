import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomRoomFlow from "./CustomRoomFlow";
import * as useCustomRoomHook from "../../hooks/useCustomRoom";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("CustomRoomFlow - join room", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("não permite entrar em sala se já é membro", async () => {
    const mockJoinRoom = vi.fn().mockResolvedValue("already_joined");
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockReturnValue({
      joinRoom: mockJoinRoom,
      createRoom: vi.fn(),
      setRoom: vi.fn(),
      room: null,
      loading: false,
      error: null,
      leaveRoom: vi.fn(),
      deleteRoom: vi.fn(),
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });
    window.alert = vi.fn();

    render(
      <BrowserRouter>
        <CustomRoomFlow />
      </BrowserRouter>
    );

    // Garante que está na aba 'Entrar'
    const entrarTab = screen.getAllByRole("button", { name: /entrar/i })[0];
    fireEvent.click(entrarTab);

    // Aguarda o input aparecer usando placeholder
    const input = await screen.findByPlaceholderText("Código da sala");
    fireEvent.change(input, { target: { value: "sala123" } });

    // O botão de entrar pode ser o segundo com o mesmo nome
    const joinButtons = screen.getAllByRole("button", { name: /entrar/i });
    const joinButton = joinButtons[joinButtons.length - 1];
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockJoinRoom).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(
        "Você já está participando desta sala."
      );
    });
  });
});
