import { generateDailyCode } from "./generateDailyCode";
import { todayKey } from "./stats";

export function getCustomRoomDailyCodeSeed(
  roomId: string,
  rodada: number,
  modo: string,
  day: string = todayKey()
): string {
  return `${day}-${roomId}-rodada${rodada}-modo${modo}`;
}

export function getCustomRoomDailyCode(
  roomId: string,
  rodada: number,
  modo: string,
  day: string = todayKey()
): string[] {
  return generateDailyCode(
    getCustomRoomDailyCodeSeed(roomId, rodada, modo, day),
    modo
  );
}
