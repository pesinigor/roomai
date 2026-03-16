import type { RoomAISession } from "@/types";

const SESSION_KEY = "roomai_session";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export function saveSession(session: RoomAISession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage may be unavailable (private browsing quota exceeded)
    console.warn("Failed to save session to sessionStorage");
  }
}

export function loadSession(): RoomAISession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as RoomAISession;

    if (Date.now() - parsed.timestamp > SESSION_TTL_MS) {
      clearSession();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
