import { renderWithTheme } from "../test-utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Game } from "./Game";
import { type Stats } from "../utils/stats";
import React from "react";

function renderGame(ui: React.ReactElement) {
  return renderWithTheme(<MemoryRouter>{ui}</MemoryRouter>);
}

function renderModeGame(
  mode: "casual" | "desafio" | "codigo-mestre",
  code: string[],
  onWin: (stats: Stats) => void
) {
  return renderGame(
    <Game mode={mode} code={code} onWin={onWin} __testCode={code} />
  );
}

function inputGuess(digits: string[]) {
  const inputs = screen.getAllByRole("textbox");
  digits.forEach((digit, i) => {
    fireEvent.change(inputs[i], { target: { value: digit } });
  });
  fireEvent.click(screen.getByRole("button", { name: /enviar palpite/i }));
}

describe("Game integração - modos diários", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("desafio: vitória atualiza stats", async () => {
    const code = ["4", "4", "4", "4"];
    let statsResult: Stats | null = null;

    renderModeGame("desafio", code, (stats) => {
      statsResult = stats;
    });

    inputGuess(code);
    await waitFor(() => expect(statsResult).not.toBeNull(), { timeout: 8000 });
    expect(statsResult!.totalWins).toBeGreaterThan(0);
  });

  it("codigo-mestre: aceita valores 0-99 e registra vitória", async () => {
    const code = ["7", "42", "0", "99"];
    let statsResult: Stats | null = null;

    renderModeGame("codigo-mestre", code, (stats) => {
      statsResult = stats;
    });

    inputGuess(["07", "42", "00", "99"]);
    await waitFor(() => expect(statsResult).not.toBeNull(), { timeout: 8000 });
    expect(statsResult!.totalWins).toBeGreaterThan(0);
  });

  it("codigo-mestre: derrota não incrementa vitórias (modo sem limite usa palpites errados consecutivos)", async () => {
    const code = ["1", "2", "3", "4"];
    let statsResult: Stats | null = null;

    renderGame(
      <Game
        mode="codigo-mestre"
        code={code}
        onWin={(stats, result) => {
          if (result === "lose") statsResult = stats;
        }}
        __testCode={code}
      />
    );

    for (let i = 0; i < 12; i++) {
      inputGuess(["9", "9", "9", "9"]);
    }

    await waitFor(() => expect(statsResult).not.toBeNull(), { timeout: 8000 });
    expect(statsResult!.totalWins).toBe(0);
  });
});
