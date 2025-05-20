import { vi } from "vitest";

describe("stats storage and accumulation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});
export {};
