import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, LogIn, LogOut, User } from "lucide-react";
import { cn } from "../lib/cn";
import { useAuth } from "../contexts/AuthContext";
import type { AuthUser } from "../api/authApi";
import type { AuthNotice } from "./AuthNoticeBanner";

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

type HeaderAccountProps = {
  variant?: "compact" | "drawer";
  onNavigate?: () => void;
};

function AccountSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-full bg-border/40",
        compact ? "h-9 w-24" : "h-11 w-36"
      )}
      aria-hidden
    />
  );
}

function GuestAccount({
  compact,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  if (compact) {
    return (
      <Link
        to="/login"
        onClick={onNavigate}
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background/90 px-3 py-2 text-sm font-semibold text-brand transition-colors hover:border-brand/40 hover:bg-brand/5"
      >
        <LogIn className="size-4 shrink-0" aria-hidden />
        <span>Entrar</span>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-border/30 text-ink-muted">
          <User className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Modo visitante</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
            Desafios salvos neste aparelho. Entre na conta para criar salas.
          </p>
          <Link
            to="/login"
            onClick={onNavigate}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            <LogIn className="size-4" aria-hidden />
            Entrar na conta
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoggedInAccount({
  user,
  compact,
  onLogout,
  onNavigate,
  loggingOut,
}: {
  user: AuthUser;
  compact?: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  loggingOut: boolean;
}) {
  const initials = getInitials(user.displayName);

  if (compact) {
    return (
      <div
        className={cn(
          "flex max-w-[min(100%,220px)] items-center gap-1 rounded-full border border-brand/25 bg-brand/6 py-1 pl-1 pr-1.5 shadow-sm transition-opacity",
          loggingOut && "opacity-60"
        )}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
          aria-hidden
        >
          {initials}
        </span>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold leading-tight text-ink">
            {user.displayName}
          </p>
          <p className="flex items-center gap-1 text-[10px] font-medium text-success">
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            Logado
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="ml-0.5 shrink-0 rounded-full p-2 text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:cursor-wait"
          aria-label="Sair da conta"
          title="Sair"
        >
          {loggingOut ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <LogOut className="size-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand/4 p-4">
      <div className="flex items-center gap-3">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {initials}
          <span
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-success"
            title="Conta ativa"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
          {user.email && (
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          )}
          <p className="mt-1 text-[11px] font-medium text-success">Conta ativa</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          void onLogout();
        }}
        disabled={loggingOut}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:border-danger/30 hover:bg-danger/5 hover:text-danger disabled:cursor-wait disabled:opacity-70"
      >
        {loggingOut ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="size-4" aria-hidden />
        )}
        {loggingOut ? "Saindo…" : "Sair da conta"}
      </button>
    </div>
  );
}

export const HeaderAccount: React.FC<HeaderAccountProps> = ({
  variant = "compact",
  onNavigate,
}) => {
  const { user, loading, logout, authTransition } = useAuth();
  const navigate = useNavigate();
  const compact = variant === "compact";
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    onNavigate?.();
    setLoggingOut(true);
    try {
      await logout();
      const notice: AuthNotice = {
        type: "logout",
        title: "Você saiu da conta",
        detail: "Continua jogando como visitante quando quiser.",
      };
      navigate("/home", { state: { authNotice: notice } });
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return <AccountSkeleton compact={compact} />;
  }

  if (!user) {
    return <GuestAccount compact={compact} onNavigate={onNavigate} />;
  }

  return (
    <LoggedInAccount
      user={user}
      compact={compact}
      onLogout={handleLogout}
      onNavigate={onNavigate}
      loggingOut={loggingOut || authTransition?.variant === "logout"}
    />
  );
};

export default HeaderAccount;
