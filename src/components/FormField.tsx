import React from "react";
import { cn } from "../lib/cn";

export function RequiredMark() {
  return (
    <span className="text-danger" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  hint,
  className,
  children,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;

  return (
    <div className={cn("form-field", className)}>
      <label htmlFor={id} className="input-label">
        {label}
        {required && <RequiredMark />}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export function fieldInputClass(invalid: boolean, extra?: string) {
  return cn(
    "input-field",
    invalid && "input-field-invalid shake-anim",
    extra
  );
}
