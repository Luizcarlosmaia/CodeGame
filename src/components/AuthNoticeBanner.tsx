import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, LogOut, X } from "lucide-react";
import { cn } from "../lib/cn";

export type AuthNotice = {
  type: "login" | "logout";
  title: string;
  detail?: string;
};

export const AuthNoticeBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notice = (location.state as { authNotice?: AuthNotice } | null)?.authNotice;
  const [visible, setVisible] = useState(Boolean(notice));

  useEffect(() => {
    if (!notice) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!notice || !visible) return null;

  const dismiss = () => {
    setVisible(false);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const isLogin = notice.type === "login";

  return (
    <div
      className={cn(
        "auth-banner-in fixed left-0 right-0 top-16 z-[90] mx-auto max-w-lg px-4",
        "sm:top-[4.5rem]"
      )}
      role="status"
    >
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md",
          isLogin
            ? "border-success/30 bg-success/10"
            : "border-border/80 bg-surface/95"
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
            isLogin ? "bg-success/15 text-success" : "bg-background text-ink-muted"
          )}
        >
          {isLogin ? (
            <CheckCircle2 className="size-5" aria-hidden />
          ) : (
            <LogOut className="size-5" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-ink">{notice.title}</p>
          {notice.detail && (
            <p className="mt-0.5 text-xs text-ink-muted">{notice.detail}</p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-ink-muted transition-colors hover:bg-black/5 hover:text-ink"
          aria-label="Fechar aviso"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default AuthNoticeBanner;
