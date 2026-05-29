import type { RoomPlayer } from "../types/customRoom";

export function memberHasLinkedAccount(member: RoomPlayer): boolean {
  return Boolean(member.accountId);
}
