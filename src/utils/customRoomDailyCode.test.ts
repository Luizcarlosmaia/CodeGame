import { describe, expect, it } from "vitest";
import {
  getCustomRoomDailyCode,
  getCustomRoomDailyCodeSeed,
} from "./customRoomDailyCode";

describe("customRoomDailyCode", () => {
  it("gera o mesmo código no mesmo dia para a mesma sala e rodada", () => {
    const day = "20250527";
    const a = getCustomRoomDailyCode("ABC123", 1, "casual", day);
    const b = getCustomRoomDailyCode("ABC123", 1, "casual", day);
    expect(a).toEqual(b);
    expect(a).toHaveLength(4);
  });

  it("muda o código quando o dia muda", () => {
    const roomId = "ABC123";
    const a = getCustomRoomDailyCode(roomId, 1, "casual", "20250527");
    const b = getCustomRoomDailyCode(roomId, 1, "casual", "20250528");
    expect(a).not.toEqual(b);
  });

  it("diferencia modos e rodadas", () => {
    const day = "20250527";
    const roomId = "ABC123";
    const coresR1 = getCustomRoomDailyCode(roomId, 1, "casual", day);
    const contagemR1 = getCustomRoomDailyCode(roomId, 1, "desafio", day);
    const coresR2 = getCustomRoomDailyCode(roomId, 2, "casual", day);

    expect(coresR1).not.toEqual(contagemR1);
    expect(coresR1).not.toEqual(coresR2);
  });

  it("monta seed estável", () => {
    expect(getCustomRoomDailyCodeSeed("X", 2, "codigo-mestre", "20250101")).toBe(
      "20250101-X-rodada2-modocodigo-mestre"
    );
  });
});
