import { loadStats, saveStats, todayKey, type Stats } from "./stats";

describe("stats storage and accumulation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("salva e carrega corretamente para o mesmo dia", () => {
    const stats: Stats = {
      date: todayKey(),
      totalGames: 2,
      totalWins: 1,
      currentStreak: 1,
      bestStreak: 1,
      distribution: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0 },
    };
    saveStats("casual", stats);
    const loaded = loadStats("casual");
    expect(loaded).toEqual(stats);
  });

  it("acumula estatísticas de dias anteriores", () => {
    // Simula um dia anterior
    const oldDate = "20240518";
    const stats: Stats = {
      date: oldDate,
      totalGames: 5,
      totalWins: 3,
      currentStreak: 2,
      bestStreak: 2,
      distribution: { 1: 2, 2: 1, 3: 2, 4: 0, 5: 0, 6: 0 },
    };
    localStorage.setItem("codeGameStats-casual", JSON.stringify(stats));
    const loaded = loadStats("casual");
    expect(loaded.date).toBe(todayKey());
    expect(loaded.totalGames).toBe(5);
    expect(loaded.totalWins).toBe(3);
    expect(loaded.currentStreak).toBe(2);
    expect(loaded.bestStreak).toBe(2);
    expect(loaded.distribution).toEqual({ 1: 2, 2: 1, 3: 2, 4: 0, 5: 0, 6: 0 });
  });

  // Teste para modo custom removido, pois está desabilitado no app.
});
export {};
