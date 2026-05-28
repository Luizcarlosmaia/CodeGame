import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import CustomRoomRodadaPainel from "./CustomRoomRodadaPainel";

describe("CustomRoomRodadaPainel", () => {
  const baseProps = {
    rodadaInfo: {
      modo: "casual",
      code: ["1", "2", "3", "4"],
      maxTries: 6,
      rodada: { rodada: 1, modo: "casual", codigo: "1234" },
    },
    guesses: [],
    hasWon: false,
    hasFinished: null,
    inputDigits: ["", "", "", ""],
    setInputDigits: vi.fn(),
    setGuesses: vi.fn(),
    handleGuess: vi.fn(),
    setRodadaAberta: vi.fn(),
    setHasFinished: vi.fn(),
  };

  it("renderiza o componente e o Game enquanto joga", () => {
    render(
      <MemoryRouter>
        <CustomRoomRodadaPainel {...baseProps} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/voltar/i)).toBeInTheDocument();
  });

  it("exibe tela de vitória com pontos e tentativas", () => {
    render(
      <CustomRoomRodadaPainel
        {...baseProps}
        guesses={[["1", "2", "3", "4"]]}
        hasFinished={{ win: true, tries: 1 }}
      />
    );
    expect(screen.getByText(/vitória!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+6 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/1 2 3 4/)).toHaveClass("custom-game-guess-chip-win");
  });

  it("exibe tela de derrota", () => {
    render(
      <CustomRoomRodadaPainel
        {...baseProps}
        guesses={[
          ["0", "0", "0", "0"],
          ["1", "1", "1", "1"],
        ]}
        hasFinished={{ win: false, tries: 6 }}
      />
    );
    expect(screen.getByText(/rodada encerrada/i)).toBeInTheDocument();
    expect(screen.queryByText(/\+.*pts/i)).not.toBeInTheDocument();
  });

  it("chama setRodadaAberta ao voltar", () => {
    const setRodadaAberta = vi.fn();
    const setHasFinished = vi.fn();
    render(
      <CustomRoomRodadaPainel
        {...baseProps}
        guesses={[["1", "2", "3", "4"]]}
        hasFinished={{ win: true, tries: 2 }}
        setRodadaAberta={setRodadaAberta}
        setHasFinished={setHasFinished}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /voltar para rodadas/i }));
    expect(setRodadaAberta).toHaveBeenCalledWith(null);
    expect(setHasFinished).toHaveBeenCalledWith(null);
  });
});
