import React, { useEffect } from "react";
import { cn } from "../lib/cn";

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        className="confirm-modal-box"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        <header className="text-center">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              variant === "danger"
                ? "bg-danger/10 text-danger"
                : "bg-brand/10 text-brand"
            )}
          >
            Confirmação
          </span>
          <h2
            id="confirm-modal-title"
            className="mt-3 text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
          >
            {title}
          </h2>
          <p
            id="confirm-modal-description"
            className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base"
          >
            {description}
          </p>
        </header>

        <div className="confirm-modal-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="confirm-modal-cancel"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "confirm-modal-confirm",
              variant === "danger" && "confirm-modal-confirm-danger"
            )}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
