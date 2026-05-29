import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  applyGuestResumeFromUrl,
  buildGuestResumeUrl,
  parseResumeSearchParams,
  persistGuestMemberIdentity,
} from "./customRoomResume";
import { ROOM_ACCESS_GRANTED_PREFIX } from "./customRoomAccess";

vi.mock("../api/roomsApi", () => ({
  roomsApi: {
    validateResume: vi.fn(),
  },
}));

import { roomsApi } from "../api/roomsApi";

describe("customRoomResume", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("parseia member e token da query", () => {
    expect(
      parseResumeSearchParams("?member=user-abc&token=secret123")
    ).toEqual({ memberId: "user-abc", token: "secret123" });
  });

  it("monta URL de retomada", () => {
    const url = buildGuestResumeUrl("ROOM1", "user-x", "tok");
    expect(url).toContain("/custom/lobby/ROOM1");
    expect(url).toContain("member=user-x");
    expect(url).toContain("token=tok");
  });

  it("persiste identidade e marca acesso", () => {
    persistGuestMemberIdentity("ROOM1", "user-x", "João");
    expect(localStorage.getItem("customRoomUserId_ROOM1")).toBe("user-x");
    expect(localStorage.getItem("customRoomUserName")).toBe("João");
    expect(localStorage.getItem(`${ROOM_ACCESS_GRANTED_PREFIX}ROOM1`)).toBe("1");
  });

  it("aplica retomada via API", async () => {
    vi.mocked(roomsApi.validateResume).mockResolvedValue({
      ok: true,
      memberId: "user-x",
      memberName: "Ana",
      roomId: "ROOM1",
    });

    const ok = await applyGuestResumeFromUrl(
      "ROOM1",
      "?member=user-x&token=abc"
    );
    expect(ok).toBe(true);
    expect(localStorage.getItem("customRoomUserId_ROOM1")).toBe("user-x");
  });
});
