import { describe, expect, it, beforeEach } from "vitest";
import type { CustomRoom } from "../types/customRoom";
import {
  canAccessProtectedRoom,
  clearRoomAccessGranted,
  getProtectedRoomEntryPath,
  isRoomAccessGranted,
  isRoomMember,
  markRoomAccessGranted,
} from "./customRoomAccess";

const room: CustomRoom = {
  id: "ROOM99",
  nome: "Sala",
  type: "permanente",
  ownerId: "u1",
  admins: ["u1"],
  membros: [
    {
      id: "u1",
      nome: "Ana",
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    },
  ],
  modo: "casual",
  rodadaAtual: 1,
  rodadas: [],
  ranking: [],
  aberta: true,
  criadaEm: "2026-05-27T12:00:00.000Z",
};

describe("customRoomAccess", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("identifica membro da sala", () => {
    expect(isRoomMember(room, "u1")).toBe(true);
    expect(isRoomMember(room, "u2")).toBe(false);
  });

  it("bloqueia acesso por link sem confirmação de entrada", () => {
    expect(canAccessProtectedRoom(room, "u1", "ROOM99")).toBe(false);
  });

  it("libera acesso após marcar entrada confirmada", () => {
    markRoomAccessGranted("ROOM99");
    expect(isRoomAccessGranted("ROOM99")).toBe(true);
    expect(canAccessProtectedRoom(room, "u1", "ROOM99")).toBe(true);
  });

  it("não libera visitante mesmo com flag de acesso", () => {
    markRoomAccessGranted("ROOM99");
    expect(canAccessProtectedRoom(room, "intruso", "ROOM99")).toBe(false);
  });

  it("monta rota de entrada com código na query", () => {
    expect(getProtectedRoomEntryPath("ABC 123")).toBe("/custom/entrar?codigo=ABC%20123");
  });

  it("limpa flag de acesso", () => {
    markRoomAccessGranted("ROOM99");
    clearRoomAccessGranted("ROOM99");
    expect(isRoomAccessGranted("ROOM99")).toBe(false);
  });
});
