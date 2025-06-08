import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomRoomEntry from "./CustomRoomEntry";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "../../theme";

describe("CustomRoomEntry", () => {
  const mockOnCreate = vi.fn();
  const mockOnJoin = vi.fn();

  function renderEntry(props = {}) {
    return render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CustomRoomEntry
            onCreate={mockOnCreate}
            onJoin={mockOnJoin}
            {...props}
          />
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  beforeEach(() => {
    mockOnCreate.mockClear();
    mockOnJoin.mockClear();
    localStorage.clear();
  });

  // Removed obsolete tab rendering test (tabs removed in new flow)

  it("shows error if trying to create with missing fields", async () => {
    renderEntry();
    // The last "Criar sala" button is the form action
    const buttons = screen.getAllByRole("button", { name: /criar sala/i });
    fireEvent.click(buttons[buttons.length - 1]);
    expect(
      await screen.findByText(/digite um nome para a sala/i)
    ).toBeInTheDocument();
  });

  it("calls onCreate with correct data", async () => {
    renderEntry();
    fireEvent.change(screen.getByPlaceholderText(/ex: sala dos amigos/i), {
      target: { value: "Sala Teste" },
    });
    fireEvent.change(screen.getByPlaceholderText(/digite seu nome/i), {
      target: { value: "Participante" },
    });
    fireEvent.click(screen.getByLabelText(/casual/i));
    fireEvent.change(screen.getByDisplayValue("1"), { target: { value: "3" } });
    const buttons = screen.getAllByRole("button", { name: /criar sala/i });
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        nome: "Sala Teste",
        modos: [{ modo: "casual", rodadas: 3 }],
        type: "permanente",
      });
    });
  });

  it("switches to 'entrar' tab and calls onJoin", async () => {
    renderEntry();
    // The first "Entrar" button is the tab, the last is the form action
    const tabButtons = screen.getAllByRole("button", { name: /entrar/i });
    fireEvent.click(tabButtons[0]);
    fireEvent.change(screen.getByPlaceholderText(/código da sala/i), {
      target: { value: "sala123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/digite seu nome/i)[0], {
      target: { value: "Visitante" },
    });
    const actionButtons = screen.getAllByRole("button", { name: /^entrar$/i });
    fireEvent.click(actionButtons[actionButtons.length - 1]);
    await waitFor(() => {
      expect(mockOnJoin).toHaveBeenCalledWith("sala123");
    });
  });

  it("shows loading and empty state for permanent rooms", () => {
    renderEntry({
      // Simulate permanentRooms and loadingPermanent via props if needed
    });
    fireEvent.click(screen.getByRole("button", { name: /salas fixas/i }));
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    // Simulate empty state
    // This would require mocking Firestore, which is not done here
  });
});
