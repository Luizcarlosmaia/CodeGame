export type GuessMode = "casual" | "desafio" | "custom" | "codigo-mestre" | string;

export function isDigitModeGuessCorrect(guess: string[], code: string[]): boolean {
  if (guess.length !== code.length) return false;
  return guess.join("") === code.join("");
}

export function isCodigoMestreGuessCorrect(guess: string[], code: string[]): boolean {
  if (guess.length !== code.length) return false;

  return guess.every((digit, index) => {
    const codeVal = code[index];
    return String(Number(digit)) === String(Number(codeVal));
  });
}

export function isGuessCorrect(
  guess: string[],
  code: string[],
  mode: GuessMode
): boolean {
  if (mode === "codigo-mestre") {
    return isCodigoMestreGuessCorrect(guess, code);
  }

  return isDigitModeGuessCorrect(guess, code);
}

export function isGuessComplete(guess: string[], mode: GuessMode): boolean {
  if (guess.some((digit) => digit === "" || digit == null)) return false;

  if (mode === "codigo-mestre") {
    return guess.every((digit) => /^\d{1,2}$/.test(digit) && Number(digit) >= 0 && Number(digit) <= 99);
  }

  return guess.every((digit) => /^[0-9]$/.test(digit));
}
