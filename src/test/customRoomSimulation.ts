import type { CustomRoom, RoomPlayer } from "../types/customRoom";
import { getCustomRoomDailyCode } from "../utils/customRoomDailyCode";
import { getCustomRoomProgressKey } from "../utils/customRoomProgress";
import { computeRoomRanking } from "../utils/customRoomStats";
import { isGuessCorrect } from "../utils/verifyGuess";
import { serializeGuess } from "../components/CustomRoom/customRoomGuessDisplay";

export interface SimulatedGuessResult {
  win: boolean;
  tries: number;
  terminou: boolean;
}

export function applyMemberRoundResult(
  room: CustomRoom,
  memberId: string,
  rodada: number,
  modo: string,
  guesses: string[][],
  day = "20260528"
): CustomRoom {
  const progressKey = getCustomRoomProgressKey(room);
  const code = getCustomRoomDailyCode(room.id, rodada, modo, day);
  const lastGuess = guesses[guesses.length - 1];
  const win = lastGuess ? isGuessCorrect(lastGuess, code, modo) : false;
  const terminou = win || guesses.length >= getMaxTriesForMode(modo);

  const membros = room.membros.map((member) => {
    if (member.id !== memberId) return member;

    const progresso = (member.progresso ?? []).filter((entry) => entry.rodada !== rodada);
    progresso.push({
      rodada,
      data: progressKey,
      tentativas: guesses.length,
      terminou,
      win,
      palpites: guesses.map((guess) => serializeGuess(guess, modo)),
    });

    return { ...member, progresso };
  });

  const nextRoom: CustomRoom = { ...room, membros };
  return {
    ...nextRoom,
    ranking: computeRoomRanking(nextRoom.membros, nextRoom.rodadas ?? [], nextRoom),
  };
}

export function joinMember(room: CustomRoom, player: RoomPlayer): CustomRoom {
  if (room.membros.some((member) => member.id === player.id)) {
    return room;
  }

  const nextRoom: CustomRoom = {
    ...room,
    membros: [...room.membros, player],
  };

  return {
    ...nextRoom,
    ranking: computeRoomRanking(nextRoom.membros, nextRoom.rodadas ?? [], nextRoom),
  };
}

export function buildWrongGuess(code: string[], modo: string): string[] {
  if (modo === "codigo-mestre") {
    return code.map((value, index) => {
      const num = Number(value);
      return String(index === 0 ? (num + 1) % 100 : num);
    });
  }

  return code.map((digit, index) => (index === 0 ? (digit === "9" ? "0" : "9") : digit));
}

function getMaxTriesForMode(modo: string): number {
  if (modo === "desafio") return 15;
  if (modo === "casual") return 6;
  return Infinity;
}

export function simulateWinOnTry(
  room: CustomRoom,
  memberId: string,
  rodada: number,
  modo: string,
  tries: number,
  day = "20260528"
): CustomRoom {
  const code = getCustomRoomDailyCode(room.id, rodada, modo, day);
  const wrong = buildWrongGuess(code, modo);
  const guesses: string[][] = [];

  for (let i = 1; i < tries; i++) {
    guesses.push([...wrong]);
  }
  guesses.push([...code.map(String)]);

  return applyMemberRoundResult(room, memberId, rodada, modo, guesses, day);
}

export function simulateLoss(room: CustomRoom, memberId: string, rodada: number, modo: string, day = "20260528"): CustomRoom {
  const code = getCustomRoomDailyCode(room.id, rodada, modo, day);
  const wrong = buildWrongGuess(code, modo);
  const maxTries = getMaxTriesForMode(modo);
  const guesses = Array.from({ length: maxTries }, () => [...wrong]);

  return applyMemberRoundResult(room, memberId, rodada, modo, guesses, day);
}
