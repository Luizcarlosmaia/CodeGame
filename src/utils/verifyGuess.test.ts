import { describe, expect, it } from "vitest";
import {
  isCodigoMestreGuessCorrect,
  isDigitModeGuessCorrect,
  isGuessComplete,
  isGuessCorrect,
} from "./verifyGuess";

describe("isDigitModeGuessCorrect", () => {
  const cases: Array<{ code: string[]; guess: string[]; expected: boolean; label: string }> = [
    { label: "acerto exato", code: ["1", "2", "3", "4"], guess: ["1", "2", "3", "4"], expected: true },
    { label: "ordem importa", code: ["1", "2", "3", "4"], guess: ["4", "3", "2", "1"], expected: false },
    { label: "um dígito errado", code: ["1", "2", "3", "4"], guess: ["1", "2", "3", "9"], expected: false },
    { label: "dígitos repetidos no código", code: ["5", "5", "3", "2"], guess: ["5", "5", "3", "2"], expected: true },
    { label: "palpite com repetição parcial", code: ["5", "5", "3", "2"], guess: ["5", "1", "1", "5"], expected: false },
    { label: "zeros à esquerda distintos", code: ["0", "1", "2", "3"], guess: ["0", "1", "2", "3"], expected: true },
    { label: "tamanhos diferentes", code: ["1", "2", "3", "4"], guess: ["1", "2", "3"], expected: false },
    { label: "string vazia nos campos", code: ["1", "2", "3", "4"], guess: ["1", "", "3", "4"], expected: false },
  ];

  it.each(cases)("$label", ({ code, guess, expected }) => {
    expect(isDigitModeGuessCorrect(guess, code)).toBe(expected);
    expect(isGuessCorrect(guess, code, "casual")).toBe(expected);
    expect(isGuessCorrect(guess, code, "desafio")).toBe(expected);
  });
});

describe("isCodigoMestreGuessCorrect", () => {
  const cases: Array<{ code: string[]; guess: string[]; expected: boolean; label: string }> = [
    { label: "valores iguais", code: ["7", "42", "0", "99"], guess: ["7", "42", "0", "99"], expected: true },
    { label: "normaliza zero à esquerda", code: ["07", "42", "0", "99"], guess: ["7", "42", "0", "99"], expected: true },
    { label: "normaliza palpite com padding", code: ["7", "42", "0", "99"], guess: ["07", "42", "00", "99"], expected: true },
    { label: "campo errado", code: ["7", "42", "0", "99"], guess: ["7", "43", "0", "99"], expected: false },
    { label: "ordem importa", code: ["7", "42", "0", "99"], guess: ["99", "0", "42", "7"], expected: false },
    { label: "limites 0 e 99", code: ["0", "99", "50", "1"], guess: ["0", "99", "50", "1"], expected: true },
  ];

  it.each(cases)("$label", ({ code, guess, expected }) => {
    expect(isCodigoMestreGuessCorrect(guess, code)).toBe(expected);
    expect(isGuessCorrect(guess, code, "codigo-mestre")).toBe(expected);
  });
});

describe("isGuessComplete", () => {
  it("exige 4 dígitos no modo casual", () => {
    expect(isGuessComplete(["1", "2", "3", ""], "casual")).toBe(false);
    expect(isGuessComplete(["1", "2", "3", "4"], "casual")).toBe(true);
    expect(isGuessComplete(["a", "2", "3", "4"], "casual")).toBe(false);
  });

  it("aceita 1 ou 2 dígitos por campo no código mestre", () => {
    expect(isGuessComplete(["7", "42", "0", "9"], "codigo-mestre")).toBe(true);
    expect(isGuessComplete(["07", "42", "0", "99"], "codigo-mestre")).toBe(true);
    expect(isGuessComplete(["7", "142", "0", "9"], "codigo-mestre")).toBe(false);
    expect(isGuessComplete(["7", "42", "", "9"], "codigo-mestre")).toBe(false);
  });
});

describe("matriz cruzada de modos", () => {
  it("não confunde comparação numérica com join de dígitos", () => {
    const code = ["12", "3", "4", "5"];
    const guessDigitMode = ["1", "2", "3", "4"];

    expect(isGuessCorrect(guessDigitMode, ["1", "2", "3", "4"], "casual")).toBe(true);
    expect(isGuessCorrect(guessDigitMode, code, "codigo-mestre")).toBe(false);
  });
});
