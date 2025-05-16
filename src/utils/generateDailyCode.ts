import seedrandom from "seedrandom";

export function generateDailyCode(seed: string): string[] {
  const rng = seedrandom(seed);

  return Array.from({ length: 4 }).map(() => {
    const digit = Math.floor(rng() * 10);
    return digit.toString();
  });
}
