/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from "vitest";
import {
  createMemberResumeLink,
  validateMemberResume,
} from "./roomMemberActions.mjs";

function createCtx(room) {
  const store = { room: { ...room } };
  return {
    sql: vi.fn().mockResolvedValue([]),
    session: { id: "acc-host" },
    body: JSON.stringify({ userId: "host-1" }),
    loadRoom: async () => store.room,
    saveRoom: async (_id, updated) => {
      store.room = updated;
      return updated;
    },
    canManageRoomAsHost: (r, accountId, inRoomId) => {
      if (r.accountOwnerId !== accountId) return false;
      const actor = (r.membros ?? []).find((m) => m.id === inRoomId);
      return actor?.accountId === accountId;
    },
    upsertRoomMembership: vi.fn(),
    get store() {
      return store;
    },
  };
}

describe("roomMemberActions — link de retomada", () => {
  const baseRoom = {
    id: "ROOM1",
    accountOwnerId: "acc-host",
    ownerId: "host-1",
    membros: [
      {
        id: "host-1",
        nome: "Host",
        accountId: "acc-host",
        terminouRodada: false,
        tentativas: [],
      },
      {
        id: "guest-1",
        nome: "Visitante",
        terminouRodada: false,
        tentativas: [],
      },
    ],
  };

  it("gera token novo a cada solicitação de link", async () => {
    const ctx = createCtx(baseRoom);

    const first = await createMemberResumeLink(ctx, "ROOM1", "guest-1");
    const second = await createMemberResumeLink(ctx, "ROOM1", "guest-1");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.resumeToken).not.toBe(first.body.resumeToken);
    expect(ctx.store.room.membros.find((m) => m.id === "guest-1").resumeToken).toBe(
      second.body.resumeToken
    );
  });

  it("consome o token após validação (uso único)", async () => {
    const ctx = createCtx(baseRoom);
    const link = await createMemberResumeLink(ctx, "ROOM1", "guest-1");
    const token = link.body.resumeToken;

    const ok = await validateMemberResume(ctx, "ROOM1", {
      memberId: "guest-1",
      token,
    });
    expect(ok.status).toBe(200);

    const reuse = await validateMemberResume(ctx, "ROOM1", {
      memberId: "guest-1",
      token,
    });
    expect(reuse.status).toBe(403);
    expect(ctx.store.room.membros.find((m) => m.id === "guest-1").resumeToken).toBeUndefined();
  });
});
