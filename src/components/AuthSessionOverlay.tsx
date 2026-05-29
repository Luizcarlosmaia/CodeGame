import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";

export type AuthTransitionState = {
  message: string;
  detail?: string;
  variant?: "default" | "success" | "logout";
};

type AuthSessionOverlayProps = {
  state: AuthTransitionState;
};

export const AuthSessionOverlay: React.FC<AuthSessionOverlayProps> = ({ state }) => {
  const variant = state.variant ?? "default";

  return (
    <div
      className="auth-overlay-in fixed inset-0 z-[500] flex items-center justify-center bg-ink/25 p-4 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "w-full max-w-sm rounded-2xl border bg-surface px-6 py-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.12)]",
          variant === "success" && "border-success/25",
          variant === "logout" && "border-border/80",
          variant === "default" && "border-brand/20"
        )}
      >
        <div
          className={cn(
            "mx-auto mb-4 flex size-14 items-center justify-center rounded-full",
            variant === "success" && "bg-success/10 text-success",
            variant === "logout" && "bg-background text-ink-muted",
            variant === "default" && "bg-brand/10 text-brand"
          )}
        >
          <Loader2 className="size-7 animate-spin" aria-hidden />
        </div>
        <p className="text-lg font-semibold text-ink">{state.message}</p>
        {state.detail && (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{state.detail}</p>
        )}
      </div>
    </div>
  );
};

export default AuthSessionOverlay;
