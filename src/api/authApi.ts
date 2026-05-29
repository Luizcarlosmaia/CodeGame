import { apiRequest, getApiBase, setAuthToken } from "./apiClient";

export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  createdAt: string;
};

type AuthResponse = {
  user: AuthUser;
  token: string;
};

export const authApi = {
  async register(email: string, password: string, displayName?: string) {
    const result = await apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
      auth: false,
    });
    setAuthToken(result.token);
    return result;
  },

  async login(email: string, password: string) {
    const result = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    setAuthToken(result.token);
    return result;
  },

  async logout() {
    try {
      await apiRequest<{ ok: boolean }>("/auth/logout", { method: "POST" });
    } finally {
      setAuthToken(null);
    }
  },

  async me() {
    return apiRequest<{ user: AuthUser }>("/auth/me");
  },

  getGoogleLoginUrl(redirect = "/custom/criar") {
    const base = getApiBase();
    const params = new URLSearchParams({ redirect });
    return `${base}/auth/google?${params}`;
  },

  async syncLocal(payload: {
    displayName?: string;
    roomMemberships?: Array<{
      roomId: string;
      memberId: string;
      role: "owner" | "member";
    }>;
  }) {
    return apiRequest<{ ok: boolean }>("/users/me/sync-local", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMyRooms() {
    return apiRequest<
      Array<{
        id: string;
        nome: string;
        modos?: { modo: string; rodadas: number }[];
        type: string;
        expiraEm?: string;
        membershipRole?: string;
      }>
    >("/users/me/rooms");
  },
};
