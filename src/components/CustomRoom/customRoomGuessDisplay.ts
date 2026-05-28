export function serializeGuess(guess: string[], modo: string): string {
  if (modo === "codigo-mestre") {
    return guess
      .map((value) => String(Number(value)).padStart(2, "0"))
      .join(",");
  }

  return guess.join("");
}

export function parseGuess(serialized: string, modo: string): string[] {
  if (modo === "codigo-mestre") {
    if (serialized.includes(",")) {
      return serialized
        .split(",")
        .map((part) => String(Number(part.trim())));
    }

    if (serialized.length >= 4 && serialized.length % 2 === 0) {
      return (
        serialized.match(/.{2}/g)?.map((part) => String(Number(part))) ?? []
      );
    }
  }

  return serialized.split("");
}

export function formatPalpiteDisplay(palpite: string, modo: string): string {
  if (modo === "codigo-mestre") {
    if (palpite.includes(",")) {
      return palpite
        .split(",")
        .map((part) => String(Number(part.trim())).padStart(2, "0"))
        .join(" ");
    }

    if (palpite.length >= 4 && palpite.length % 2 === 0) {
      return (
        palpite.match(/.{2}/g)?.map((part) => String(Number(part)).padStart(2, "0")) ??
        []
      ).join(" ");
    }
  }

  return palpite.split("").join(" ");
}

export function getGuessChipClassName(
  isLast: boolean,
  highlightResult: boolean,
  won: boolean
): string {
  if (!highlightResult || !isLast) return "custom-game-guess-chip";

  return won
    ? "custom-game-guess-chip custom-game-guess-chip-win"
    : "custom-game-guess-chip custom-game-guess-chip-loss";
}
