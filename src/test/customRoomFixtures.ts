import type { CustomRoom, RoomPlayer } from "../types/customRoom";
import { computeRoomRanking } from "../utils/customRoomStats";

export function createRoomMembers(
  count: number,
  options?: { withProgress?: boolean; ownerId?: string }
): RoomPlayer[] {
  const ownerId = options?.ownerId ?? "owner-1";

  return Array.from({ length: count }, (_, index) => {
    const id = index === 0 ? ownerId : `player-${index + 1}`;
    const member: RoomPlayer = {
      id,
      nome: index === 0 ? "Anfitrião" : `Jogador ${index + 1}`,
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    };

    if (options?.withProgress && index > 0) {
      member.progresso = [
        {
          rodada: 1,
          data: "20260528",
          tentativas: (index % 6) + 1,
          terminou: true,
          win: true,
        },
      ];
    }

    return member;
  });
}

export function createCustomRoom(
  memberCount: number,
  overrides?: Partial<CustomRoom>
): CustomRoom {
  const membros = createRoomMembers(memberCount, { withProgress: true });
  const rodadas = [
    { rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" },
  ];

  const room: CustomRoom = {
    id: "ROOM-SCALE",
    nome: "Sala Escala",
    type: "permanente",
    ownerId: membros[0].id,
    admins: [membros[0].id],
    membros,
    modo: "casual",
    modos: [{ modo: "casual", rodadas: 1 }],
    rodadaAtual: 1,
    rodadas,
    ranking: [],
    aberta: true,
    criadaEm: "2026-05-27T12:00:00.000Z",
    rankingPeriodo: "nunca",
    ...overrides,
  };

  return {
    ...room,
    ranking: computeRoomRanking(room.membros, room.rodadas, room),
  };
}
