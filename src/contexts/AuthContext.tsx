import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, type AuthUser } from "../api/authApi";
import { getAuthToken, setAuthToken } from "../api/apiClient";
import type { AuthTransitionState } from "../components/AuthSessionOverlay";
import { syncLocalStorageToAccount } from "../utils/accountSync";

const WELCOME_PAUSE_MS = 700;

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authTransition: AuthTransitionState | null;
  setAuthTransition: (state: AuthTransitionState | null) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  completeOAuthLogin: (token: string) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authTransition, setAuthTransition] = useState<AuthTransitionState | null>(
    null
  );

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { user: me } = await authApi.me();
      setUser(me);
    } catch {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthTransition({
      message: "Entrando na sua conta…",
      detail: "Validando e-mail e senha",
    });
    try {
      const { user: logged } = await authApi.login(email, password);
      setUser(logged);
      setAuthTransition({
        message: `Bem-vindo, ${logged.displayName}!`,
        detail: "Vinculando suas salas…",
        variant: "success",
      });
      await syncLocalStorageToAccount(logged.id);
      await pause(WELCOME_PAUSE_MS);
      return logged;
    } catch (error) {
      setAuthTransition(null);
      throw error;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setAuthTransition({
        message: "Criando sua conta…",
        detail: "Quase lá",
      });
      try {
        const { user: created } = await authApi.register(email, password, displayName);
        setUser(created);
        setAuthTransition({
          message: `Conta criada, ${created.displayName}!`,
          detail: "Preparando suas salas…",
          variant: "success",
        });
        await syncLocalStorageToAccount(created.id);
        await pause(WELCOME_PAUSE_MS);
        return created;
      } catch (error) {
        setAuthTransition(null);
        throw error;
      }
    },
    []
  );

  const completeOAuthLogin = useCallback(async (token: string) => {
    setAuthToken(token);
    setAuthTransition({
      message: "Conectando com Google…",
      detail: "Confirmando sua conta",
    });
    try {
      const { user: me } = await authApi.me();
      setUser(me);
      setAuthTransition({
        message: `Bem-vindo, ${me.displayName}!`,
        detail: "Vinculando suas salas…",
        variant: "success",
      });
      await syncLocalStorageToAccount(me.id);
      await pause(WELCOME_PAUSE_MS);
      return me;
    } catch (error) {
      setAuthToken(null);
      setUser(null);
      setAuthTransition(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthTransition({
      message: "Saindo da conta…",
      detail: "Encerrando sua sessão com segurança",
      variant: "logout",
    });
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      await pause(400);
      setAuthTransition(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authTransition,
      setAuthTransition,
      login,
      register,
      logout,
      refresh,
      completeOAuthLogin,
    }),
    [
      user,
      loading,
      authTransition,
      login,
      register,
      logout,
      refresh,
      completeOAuthLogin,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
