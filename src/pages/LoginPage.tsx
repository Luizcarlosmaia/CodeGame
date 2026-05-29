import React, { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { FormField, fieldInputClass } from "../components/FormField";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../api/authApi";
import type { AuthNotice } from "../components/AuthNoticeBanner";
import { cn } from "../lib/cn";

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const LoginPage: React.FC = () => {
  const {
    user,
    loading,
    authTransition,
    login,
    register,
    completeOAuthLogin,
    setAuthTransition,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/custom/criar";
  const oauthError = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(
    oauthError === "oauth_failed"
      ? "Não foi possível entrar com Google. Tente novamente."
      : ""
  );
  const [oauthStarted, setOauthStarted] = useState(false);

  const finishLogin = useCallback(
    (loggedUser: { displayName: string }, isNew = false) => {
      const notice: AuthNotice = {
        type: "login",
        title: isNew ? "Conta criada com sucesso" : `Olá, ${loggedUser.displayName}!`,
        detail: isNew
          ? "Agora você pode criar e gerenciar salas."
          : "Sua sessão está ativa.",
      };
      setAuthTransition(null);
      navigate(redirect, { replace: true, state: { authNotice: notice } });
    },
    [navigate, redirect, setAuthTransition]
  );

  React.useEffect(() => {
    const oauthToken = searchParams.get("token");
    if (!oauthToken) return;

    void (async () => {
      try {
        const me = await completeOAuthLogin(oauthToken);
        finishLogin(me, false);
      } catch {
        setAuthTransition(null);
        setError("Não foi possível concluir o login com Google.");
      }
    })();
  }, [searchParams, completeOAuthLogin, finishLogin, setAuthTransition]);

  React.useEffect(() => {
    if (searchParams.get("token")) return;
    if (!loading && user) {
      navigate(redirect, { replace: true });
    }
  }, [loading, user, navigate, redirect, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const logged =
        mode === "login"
          ? await login(email.trim(), password)
          : await register(email.trim(), password, displayName.trim() || undefined);
      finishLogin(logged, mode === "register");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    setOauthStarted(true);
    setAuthTransition({
      message: "Redirecionando ao Google…",
      detail: "Você voltará aqui automaticamente",
    });
  };

  const googleUrl = authApi.getGoogleLoginUrl(redirect);
  const formHidden = Boolean(authTransition) || oauthStarted;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 pt-24">
      <BackButton to="/home" />
      <h1 className="mt-4 text-2xl font-bold text-ink">
        {mode === "login" ? "Entrar na conta" : "Criar conta"}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Necessário para criar salas e acessá-las de qualquer dispositivo.
        Visitantes podem jogar e entrar em salas com código sem login.
      </p>

      <div
        className={cn(
          "mt-6 transition-opacity duration-200",
          formHidden && "pointer-events-none opacity-40"
        )}
        aria-hidden={formHidden}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <FormField id="displayName" label="Nome de exibição">
              <input
                id="displayName"
                type="text"
                className={fieldInputClass(false)}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                placeholder="Como aparecer nas salas"
                disabled={submitting}
              />
            </FormField>
          )}

          <FormField id="email" label="E-mail" required>
            <input
              id="email"
              type="email"
              className={fieldInputClass(false)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={submitting}
            />
          </FormField>

          <FormField id="password" label="Senha" required>
            <input
              id="password"
              type="password"
              className={fieldInputClass(false)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
              required
              disabled={submitting}
            />
          </FormField>

          {error && (
            <p
              className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || formHidden}
            className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
          >
            {submitting
              ? "Aguarde…"
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-sm text-ink-soft">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <a
          href={googleUrl}
          onClick={handleGoogleClick}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 font-medium text-ink shadow-sm transition hover:border-border hover:bg-[#f8f9fa] hover:shadow"
        >
          <GoogleIcon />
          <span>Entrar com Google</span>
        </a>

        <p className="mt-6 text-center text-sm text-ink-soft">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                type="button"
                className="font-semibold text-brand hover:underline"
                onClick={() => setMode("register")}
                disabled={submitting}
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                className="font-semibold text-brand hover:underline"
                onClick={() => setMode("login")}
                disabled={submitting}
              >
                Entrar
              </button>
            </>
          )}
        </p>

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link
            to="/custom/entrar"
            className="inline-flex items-center gap-1 font-semibold text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:text-brand/80 hover:decoration-brand"
          >
            Entrar em sala como visitante
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
