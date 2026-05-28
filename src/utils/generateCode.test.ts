import { describe, expect, it, vi } from "vitest";
import { generateCode } from "./generateCode";

describe("generateCode", () => {
  it("gera 4 dígitos 0-9 no modo padrão", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.55);

    expect(generateCode()).toEqual(["5", "5", "5", "5"]);
    vi.restoreAllMocks();
  });

  it("gera 4 valores 0-99 no modo codigo-mestre", () => {
    const random = vi.spyOn(Math, "random");
    random.mockReturnValueOnce(0).mockReturnValueOnce(0.99).mockReturnValueOnce(0.5).mockReturnValueOnce(0.01);

    expect(generateCode("codigo-mestre")).toEqual(["0", "99", "50", "1"]);
    vi.restoreAllMocks();
  });

  it("sempre retorna strings numéricas", () => {
    for (let i = 0; i < 30; i++) {
      const code = generateCode();
      expect(code).toHaveLength(4);
      code.forEach((digit) => {
        expect(digit).toMatch(/^[0-9]$/);
      });
    }
  });

  it("codigo-mestre respeita faixa 0-99", () => {
    for (let i = 0; i < 30; i++) {
      const code = generateCode("codigo-mestre");
      expect(code).toHaveLength(4);
      code.forEach((value) => {
        const num = Number(value);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(99);
      });
    }
  });
});
