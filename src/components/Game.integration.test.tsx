import { renderWithTheme } from "../test-utils";
import { screen, fireEvent } from "@testing-library/react";
import { Game } from "./Game";
import { type Stats } from "../utils/stats";

// Utilitário para simular input de dígitos
function inputGuess(digits: string[]) {
  const inputs = screen.getAllByRole("textbox");
  digits.forEach((digit, i) => {
    fireEvent.change(inputs[i], { target: { value: digit } });
  });
  fireEvent.click(screen.getByText(/enviar/i));
}

describe("Game integração - vitória e derrota", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exibe mensagem de vitória, atualiza stats e bloqueia input após ganhar", () => {
    // Código secreto fixo para teste
    const code = ["1", "2", "3", "4"];
    // Mock do onWin para capturar stats
    let statsResult: Stats | null = null;
    renderWithTheme(
      <Game
        mode="casual"
        onWin={(s) => {
          statsResult = s;
        }}
        __testCode={code}
      />
    );
    // Primeira tentativa errada
    inputGuess(["1", "1", "1", "1"]);
    expect(screen.queryByText(/parabéns/i)).not.toBeInTheDocument();
    // Segunda tentativa correta
    inputGuess(["1", "2", "3", "4"]);
    expect(screen.getByText(/parabéns/i)).toBeInTheDocument();
    // Stats atualizados
    expect(statsResult).not.toBeNull();
    expect(statsResult!.totalGames).toBeGreaterThan(0);
    expect(statsResult!.totalWins).toBeGreaterThan(0);
    // Inputs bloqueados
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("exibe mensagem de derrota, atualiza stats e bloqueia input após perder", () => {
    // Código secreto fixo para teste
    const code = ["1", "2", "3", "4"];
    let statsResult: Stats | null = null;
    renderWithTheme(
      <Game
        mode="casual"
        onWin={(s) => {
          statsResult = s;
        }}
        __testCode={code}
      />
    );
    // 6 tentativas erradas (modo casual)
    for (let i = 0; i < 6; i++) {
      inputGuess(["9", "9", "9", "9"]);
    }
    expect(screen.getByText(/você perdeu/i)).toBeInTheDocument();
    expect(statsResult).not.toBeNull();
    expect(statsResult!.totalGames).toBeGreaterThan(0);
    // Inputs bloqueados
    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
