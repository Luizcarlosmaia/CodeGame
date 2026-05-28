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
    renderWithTheme(
      <StatsModal
        stats={baseStats}
        maxTries={6}
        onClose={() => {}}
        gameResult="win"
      />
    );
    expect(
      screen.getByText(/Você acertou o código!/i)
    ).toBeInTheDocument();
  });

  it("exibe mensagem de derrota", () => {
    renderWithTheme(
      <StatsModal
        stats={baseStats}
        maxTries={6}
        onClose={() => {}}
        gameResult="lose"
      />
    );
    expect(screen.getByText(/Não foi dessa vez!/i)).toBeInTheDocument();
  });

  it("renderiza barras de distribuição corretas", () => {
    renderWithTheme(
      <StatsModal stats={baseStats} maxTries={6} onClose={() => {}} />
    );
    for (let i = 1; i <= 5; i++) {
      const value = String(
        baseStats.distribution[i as keyof typeof baseStats.distribution] || 0
      );
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    }
  });
});
