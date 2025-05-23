import { screen } from "@testing-library/react";
import { StatsModal } from "./StatsModal";

import { renderWithTheme } from "../test-utils";

const baseStats = {
  totalGames: 5,
  totalWins: 3,
  currentStreak: 2,
  bestStreak: 2,
  distribution: { 1: 1, 2: 2, 3: 0, 4: 1, 5: 1 },
  date: "20250523",
};

describe("StatsModal", () => {
  it("exibe mensagem de vitória", () => {
    const stats = {
      ...baseStats,
      currentStreak: 2,
      totalWins: 5,
      totalGames: 5,
    };
    renderWithTheme(
      <StatsModal stats={stats} maxTries={6} onClose={() => {}} />
    );
    expect(
      screen.getByText(/Parabéns! Você acertou o código!/i)
    ).toBeInTheDocument();
  });

  it("exibe mensagem de derrota", () => {
    const stats = {
      ...baseStats,
      currentStreak: 0,
      totalWins: 2,
      totalGames: 5,
    };
    renderWithTheme(
      <StatsModal stats={stats} maxTries={6} onClose={() => {}} />
    );
    expect(screen.getByText(/Não foi dessa vez!/i)).toBeInTheDocument();
  });

  it("renderiza barras de distribuição corretas", () => {
    renderWithTheme(
      <StatsModal stats={baseStats} maxTries={6} onClose={() => {}} />
    );
    // Deve renderizar 5 barras (1 a 5)
    for (let i = 1; i <= 5; i++) {
      const value = String(
        baseStats.distribution[i as keyof typeof baseStats.distribution] || 0
      );
      // Busca apenas divs (BarFill) com o valor esperado
      const barDivs = screen
        .getAllByText(value)
        .filter((el) => el.tagName === "DIV");
      expect(barDivs.length).toBeGreaterThan(0);
    }
  });
});
