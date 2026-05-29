/**
 * @vitest-environment node
 */
import { describe, expect, it, beforeAll } from "vitest";
import {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
} from "./auth.mjs";

beforeAll(() => {
  process.env.AUTH_JWT_SECRET = "unit-test-secret-min-16-chars";
});

describe("auth helpers", () => {
  it("hash e verifica senha", () => {
    const stored = hashPassword("minhasenha123");
    expect(verifyPassword("minhasenha123", stored)).toBe(true);
    expect(verifyPassword("errada", stored)).toBe(false);
  });

  it("emite e valida JWT", () => {
    const token = signToken({ sub: "user-uuid-1", email: "a@b.com" });
    const payload = verifyToken(token);
    expect(payload?.sub).toBe("user-uuid-1");
    expect(payload?.email).toBe("a@b.com");
    expect(verifyToken("invalid.token.here")).toBeNull();
  });
});
