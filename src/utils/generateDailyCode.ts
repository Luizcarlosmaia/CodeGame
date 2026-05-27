import seedrandom from "seedrandom";

export function generateDailyCode(seed: string, mode?: string): string[] {
  const rng = seedrandom(seed);
  if (mode === "codigo-mestre") {
    // 4 campos de 0 a 99
    return Array.from({ length: 4 }).map(() => {
      const val = Math.floor(rng() * 100);
      return val.toString();
    });
  }
  // padrão: 4 dígitos 0-9
  return Array.from({ length: 4 }).map(() => {
    const digit = Math.floor(rng() * 10);
    return digit.toString();
  });
}
