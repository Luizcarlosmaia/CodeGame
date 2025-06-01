import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import * as statsUtils from "../utils/stats";
import { useGame } from "./useGame";

describe("useGame - custom mode daily reset", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("reseta o código no modo custom ao trocar o dia", () => {
    let currentDay = "20250601";
    vi.spyOn(statsUtils, "todayKey").mockImplementation(() => currentDay);

    // Força localStorage limpo
    localStorage.removeItem("codeGameState-custom");

    const { result } = renderHook(() => useGame("custom", () => {}));
    const codeDay1 =
      result.current.secretCode && result.current.secretCode.length > 0
        ? result.current.secretCode.join("")
        : undefined;
    console.log("codeDay1", codeDay1, result.current.secretCode);

    // Simula troca de dia
    act(() => {
      currentDay = "20250602";
      vi.advanceTimersByTime(61 * 1000); // força o efeito de reset diário
    });

    const codeDay2 =
      result.current.secretCode && result.current.secretCode.length > 0
        ? result.current.secretCode.join("")
        : undefined;
    console.log("codeDay2", codeDay2, result.current.secretCode);

    expect(codeDay1).toBeDefined();
    expect(codeDay2).toBeDefined();
    expect(codeDay1).not.toBe("");
    expect(codeDay2).not.toBe("");
    expect(codeDay1).not.toBe(codeDay2);
  });
});
