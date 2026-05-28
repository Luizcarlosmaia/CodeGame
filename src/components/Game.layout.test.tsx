import { renderWithTheme } from "../test-utils";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Game } from "./Game";
import { GuessRow } from "./GuessRow";

describe("Game layout — células com conteúdo máximo", () => {
  it("GuessRow casual usa flex-nowrap para não quebrar dígitos", () => {
    const { container } = renderWithTheme(
      <GuessRow
        guess={["9", "8", "7", "6"]}
        code={["1", "2", "3", "4"]}
        mode="casual"
        attempt={1}
      />
    );

    const row = container.querySelector(".flex");
    expect(row).toHaveClass("flex-nowrap");
    expect(container.querySelectorAll(".guess-digit-casual")).toHaveLength(4);
  });

  it("renderiza modo Cores com tabuleiro de 6 linhas", () => {
    localStorage.clear();

    renderWithTheme(
      <MemoryRouter>
        <Game mode="casual" onWin={() => {}} __testCode={["1", "2", "3", "4"]} />
      </MemoryRouter>
    );

    expect(screen.getByText(/tentativa 1 de 6/i)).toBeInTheDocument();
    expect(document.querySelectorAll(".game-casual-row")).toHaveLength(6);
    expect(document.querySelector(".game-casual-board")).toBeInTheDocument();
  });
});
