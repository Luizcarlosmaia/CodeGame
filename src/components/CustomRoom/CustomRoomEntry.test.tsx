import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomRoomEntry from "./CustomRoomEntry";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

vi.mock("../../utils/customRoomStorage", () => ({
  fetchMyCustomRooms: vi.fn().mockResolvedValue([]),
}));

describe("CustomRoomEntry", () => {
  const mockOnCreate = vi.fn();
  const mockOnJoin = vi.fn();

  function renderEntry(props = {}) {
    return render(
      <BrowserRouter>
        <CustomRoomEntry
          onCreate={mockOnCreate}
          onJoin={mockOnJoin}
          forceTab="entrar"
          hideTabs
          {...props}
        />
      </BrowserRouter>
    );
  }

  beforeEach(() => {
    mockOnCreate.mockClear();
    mockOnJoin.mockClear();
    localStorage.clear();
  });

  it("mostra erro ao entrar sem preencher campos", async () => {
    renderEntry();
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));
    expect(await screen.findByText(/digite seu nome/i)).toBeInTheDocument();
  });

  it("chama onJoin com código da sala", async () => {
    mockOnJoin.mockResolvedValue(true);
    renderEntry();

    fireEvent.change(screen.getByPlaceholderText(/código da sala/i), {
      target: { value: "sala123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/digite seu nome/i), {
      target: { value: "Visitante" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockOnJoin).toHaveBeenCalledWith("sala123");
    });
  });

  it("mostra erro quando usuário já está na sala", async () => {
    mockOnJoin.mockResolvedValue("already_joined");
    renderEntry();

    fireEvent.change(screen.getByPlaceholderText(/código da sala/i), {
      target: { value: "sala123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/digite seu nome/i), {
      target: { value: "Visitante" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    expect(
      await screen.findByText(/já está participando desta sala/i)
    ).toBeInTheDocument();
  });

  it("mostra estado vazio de salas permanentes", async () => {
    renderEntry();
    expect(
      await screen.findByText(/nenhuma sala ativa disponível/i)
    ).toBeInTheDocument();
  });
});
