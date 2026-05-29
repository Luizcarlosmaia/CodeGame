import { roomsApi } from "../api/roomsApi";
import { markRoomAccessGranted } from "./customRoomAccess";

const USER_ID_PREFIX = "customRoomUserId_";

export function parseResumeSearchParams(search: string): {
  memberId: string | null;
  token: string | null;
} {
  const params = new URLSearchParams(search);
  const memberId = params.get("member")?.trim() || null;
  const token = params.get("token")?.trim() || null;
  return { memberId, token };
}

export function buildGuestResumeUrl(roomId: string, memberId: string, token: string): string {
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/custom/lobby/${encodeURIComponent(roomId)}`
      : `/custom/lobby/${encodeURIComponent(roomId)}`;
  const params = new URLSearchParams({ member: memberId, token });
  return `${base}?${params.toString()}`;
}

export function persistGuestMemberIdentity(
  roomId: string,
  memberId: string,
  memberName?: string
): void {
  localStorage.setItem(`${USER_ID_PREFIX}${roomId}`, memberId);
  if (memberName?.trim()) {
    localStorage.setItem("customRoomUserName", memberName.trim());
  }
  markRoomAccessGranted(roomId);
}

/** Valida link de retomada e grava identidade local; retorna false se inválido. */
export async function applyGuestResumeFromUrl(
  roomId: string,
  search: string
): Promise<boolean> {
  const { memberId, token } = parseResumeSearchParams(search);
  if (!memberId || !token) return false;

  try {
    const result = await roomsApi.validateResume(roomId, memberId, token);
    persistGuestMemberIdentity(roomId, result.memberId, result.memberName);
    return true;
  } catch {
    return false;
  }
}
