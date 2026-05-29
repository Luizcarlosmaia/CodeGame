const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "cg_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit & { auth?: boolean }
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token && options?.auth !== false) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const raw = await response.text();
  let payload: unknown = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      if (raw.trimStart().startsWith("<!DOCTYPE") || raw.trimStart().startsWith("<html")) {
        throw new Error(
          "API indisponível. Reinicie o app com npm run dev (servidor local + Vite)."
        );
      }
      throw new Error("Resposta inválida da API.");
    }
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error?: string }).error === "string"
        ? (payload as { error: string }).error
        : response.statusText;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return payload as T;
}

export function getApiBase(): string {
  return API_BASE;
}
