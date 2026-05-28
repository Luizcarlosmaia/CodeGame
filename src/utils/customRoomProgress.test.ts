import { describe, expect, it } from "vitest";
import {
  findRoundProgress,
  getCustomRoomCodeSessionKey,
  getCustomRoomProgressKey,
} from "./customRoomProgress";
import type { CustomRoom, RoomPlayer } from "../types/customRoom";

const tempRoom: Pick<CustomRoom, "type" | "partidaNumero"> = {
  type: "temporaria",
  partidaNumero: 2,
};

const player: RoomPlayer = {
  id: "u1",
  nome: "Teste",
  terminouRodada: false,
  tentativas: [],
  progresso: [
    {
      rodada: 1,
      data: "20260527",
      tentativas: 3,
      terminou: false,
      palpites: ["1111"],
    },
  ],
};

describe("customRoomProgress", () => {
  it("usa partidaNumero como chave em salas temporárias", () => {
    expect(getCustomRoomProgressKey(tempRoom)).toBe("p2");
  });

  it("encontra progresso legado por data em sala temporária", () => {
    expect(findRoundProgress(player, 1, tempRoom)?.tentativas).toBe(3);
  });

  it("mantém seed do código alinhado ao progresso legado", () => {
    expect(getCustomRoomCodeSessionKey(tempRoom, player, 1)).toBe("20260527");
  });

  it("usa chave da partida quando não há progresso legado", () => {
    expect(getCustomRoomCodeSessionKey(tempRoom, undefined, 1)).toBe("p2");
  });
});
