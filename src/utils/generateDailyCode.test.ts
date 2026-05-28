import { describe, expect, it } from "vitest";
import { generateDailyCode } from "./generateDailyCode";

describe("generateDailyCode", () => {
  it("é determinístico para a mesma seed", () => {
    const a = generateDailyCode("20260527-casual");
    const b = generateDailyCode("20260527-casual");
    expect(a).toEqual(b);
  });

  it("gera códigos diferentes para seeds diferentes", () => {
    const casual = generateDailyCode("20260527-casual");
    const desafio = generateDailyCode("20260527-desafio");
    expect(casual).not.toEqual(desafio);
  });

  it("modo casual/desafio usa dígitos 0-9", () => {
    const code = generateDailyCode("fixed-seed-123");
    expect(code).toHaveLength(4);
    code.forEach((digit) => {
      expect(Number(digit)).toBeGreaterThanOrEqual(0);
      expect(Number(digit)).toBeLessThanOrEqual(9);
    });
  });

  it("modo codigo-mestre usa valores 0-99", () => {
    const code = generateDailyCode("fixed-seed-cm", "codigo-mestre");
    expect(code).toHaveLength(4);
    code.forEach((value) => {
      const num = Number(value);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(99);
    });
  });

  it("mantém formato string mesmo com zero", () => {
    const code = generateDailyCode("zero-leading-seed", "codigo-mestre");
    code.forEach((value) => {
      expect(typeof value).toBe("string");
    });
  });
});
