import React from "react";
import { cn } from "../lib/cn";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  loading,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn("btn-primary mt-3", className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="size-[22px] animate-spin-slow rounded-full border-[3px] border-white border-t-success"
          aria-hidden
        />
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;
