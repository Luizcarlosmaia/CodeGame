// utils/getFeedback.ts
import type { Feedback } from "../types";

type Status = "correct" | "present" | "absent";

export interface DetailedFeedback extends Feedback {
  statuses: Status[];
}

export const getFeedback = (guess: string[], code: string[]): Feedback => {
  let correctPlace = 0;
  let correctDigit = 0;
  const usedIndices = new Set<number>();

  guess.forEach((digit, idx) => {
    if (digit === code[idx]) {
      correctPlace++;
      usedIndices.add(idx);
    }
  });

  guess.forEach((digit, idx) => {
    if (digit !== code[idx]) {
      const index = code.findIndex(
        (d, i) => d === digit && !usedIndices.has(i) && guess[i] !== code[i]
      );
      if (index !== -1) {
        correctDigit++;
        usedIndices.add(index);
      }
    }
  });

  return { correctPlace, correctDigit };
};

// Nova função para status individuais
export const getStatuses = (guess: string[], code: string[]): Status[] => {
  const statuses: Status[] = Array(guess.length).fill("absent");
  const codeDigits = [...code];

  // 1) marque verts
  guess.forEach((d, i) => {
    if (d === code[i]) {
      statuses[i] = "correct";
      codeDigits[i] = null!;
    }
  });

  // 2) marque amarelos
  guess.forEach((d, i) => {
    if (statuses[i] === "absent") {
      const j = codeDigits.indexOf(d);
      if (j !== -1) {
        statuses[i] = "present";
        codeDigits[j] = null!;
      }
    }
  });

  return statuses;
};
