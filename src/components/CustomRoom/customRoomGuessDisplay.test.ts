import { describe, expect, it } from "vitest";
import {
  formatPalpiteDisplay,
  getGuessChipClassName,
  parseGuess,
  serializeGuess,
} from "./customRoomGuessDisplay";

describe("customRoomGuessDisplay", () => {
  it("serializa e restaura palpite de código mestre", () => {
    const guess = ["77", "55", "66", "33"];
    const serialized = serializeGuess(guess, "codigo-mestre");
    expect(serialized).toBe("77,55,66,33");
    expect(parseGuess(serialized, "codigo-mestre")).toEqual(guess);
  });

  it("restaura formato legado sem vírgulas", () => {
    expect(parseGuess("77556633", "codigo-mestre")).toEqual([
      "77",
      "55",
      "66",
      "33",
    ]);
  });

  it("serializa palpite de cores", () => {
    expect(serializeGuess(["1", "2", "3", "4"], "casual")).toBe("1234");
    expect(parseGuess("1234", "casual")).toEqual(["1", "2", "3", "4"]);
  });

  it("formata palpite de cores com espaços", () => {
    expect(formatPalpiteDisplay("1234", "casual")).toBe("1 2 3 4");
  });

  it("formata palpite de código mestre", () => {
    expect(formatPalpiteDisplay("05,99", "codigo-mestre")).toBe("05 99");
    expect(formatPalpiteDisplay("0599", "codigo-mestre")).toBe("05 99");
  });

  it("aplica classe de vitória ou derrota só na última tentativa", () => {
    expect(getGuessChipClassName(false, true, true)).toBe("custom-game-guess-chip");
    expect(getGuessChipClassName(true, true, true)).toContain("custom-game-guess-chip-win");
    expect(getGuessChipClassName(true, true, false)).toContain(
      "custom-game-guess-chip-loss"
    );
  });
});
