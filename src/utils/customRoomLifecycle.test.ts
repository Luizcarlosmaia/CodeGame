import { describe, expect, it } from "vitest";
import {
  applyTemporaryRoomExpiry,
  buildNewMatchPatch,
  formatExpiryCountdown,
  getTemporaryRoomExpiresAt,
  isRoomPlayable,
  isTemporaryRoomExpired,
  TEMPORARY_ROOM_TTL_MS,
} from "./customRoomLifecycle";
import type { CustomRoom } from "../types/customRoom";

const baseRoom: CustomRoom = {
  id: "ABC123",
  nome: "Teste",
  type: "temporaria",
  ownerId: "owner1",
  admins: ["owner1"],
  membros: [
    {
      id: "owner1",
      nome: "Dono",
      terminouRodada: true,
      tentativas: [3],
      progresso: [{ rodada: 1, data: "2026-05-27", tentativas: 3, terminou: true }],
    },
  ],
  modo: "casual",
  rodadaAtual: 2,
  rodadas: [{ rodada: 1, codigo: "", encerrada: true, inicio: "x" }],
  ranking: [{ playerId: "owner1", nome: "Dono", pontos: 5 }],
  aberta: true,
  criadaEm: "2026-05-27T10:00:00.000Z",
  expiraEm: "2099-01-01T00:00:00.000Z",
  partidaNumero: 1,
};

describe("customRoomLifecycle", () => {
  it("calcula expiraEm 5h à frente", () => {
    const from = new Date("2026-05-27T10:00:00.000Z");
    expect(getTemporaryRoomExpiresAt(from)).toBe(
      new Date(from.getTime() + TEMPORARY_ROOM_TTL_MS).toISOString()
    );
  });

  it("detecta sala temporária expirada", () => {
    const expiring = { ...baseRoom, expiraEm: "2026-05-27T15:00:00.000Z" };
    expect(
      isTemporaryRoomExpired(expiring, new Date("2026-05-27T15:00:01.000Z").getTime())
    ).toBe(true);
    expect(
      isTemporaryRoomExpired(expiring, new Date("2026-05-27T14:59:00.000Z").getTime())
    ).toBe(false);
  });

  it("desativa sala expirada sem repetir patch", () => {
    const expired = applyTemporaryRoomExpiry({
      ...baseRoom,
      expiraEm: "2020-01-01T00:00:00.000Z",
    });
    expect(expired.aberta).toBe(false);
    expect(expired.expiradaEm).toBeTruthy();

    const again = applyTemporaryRoomExpiry(expired);
    expect(again).toBe(expired);
  });

  it("isRoomPlayable rejeita sala expirada ou fechada", () => {
    expect(isRoomPlayable(baseRoom)).toBe(true);
    expect(isRoomPlayable({ ...baseRoom, aberta: false })).toBe(false);
    expect(
      isRoomPlayable({ ...baseRoom, expiraEm: "2020-01-01T00:00:00.000Z" })
    ).toBe(false);
  });

  it("formata countdown restante", () => {
    const expiraEm = "2026-05-27T15:00:00.000Z";
    expect(
      formatExpiryCountdown(expiraEm, new Date("2026-05-27T14:30:00.000Z").getTime())
    ).toBe("30 min");
    expect(
      formatExpiryCountdown(expiraEm, new Date("2026-05-27T15:00:00.000Z").getTime())
    ).toBe("Expirada");
  });

  it("buildNewMatchPatch zera progresso e rodadas", () => {
    const patch = buildNewMatchPatch(baseRoom, "owner1");
    expect(patch.partidaNumero).toBe(2);
    expect(patch.ranking).toEqual([]);
    expect(patch.membros?.[0].progresso).toEqual([]);
    expect(patch.rodadas?.[0].encerrada).toBe(false);
  });

  it("buildNewMatchPatch exige anfitrião e sala ativa", () => {
    expect(() => buildNewMatchPatch(baseRoom, "outro")).toThrow(/anfitrião/i);
    expect(() =>
      buildNewMatchPatch(
        { ...baseRoom, expiraEm: "2020-01-01T00:00:00.000Z" },
        "owner1"
      )
    ).toThrow(/expirou/i);
  });
});
