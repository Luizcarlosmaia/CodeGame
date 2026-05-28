import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";

interface BackButtonProps {
  to?: string;
  ariaLabel?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  to = "/home",
  ariaLabel = "Voltar",
  className,
}) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      aria-label={ariaLabel}
      className={cn(
        "mt-2.5 inline-flex cursor-pointer items-center border-0 bg-transparent p-0",
        className
      )}
    >
      <span className="mr-1 inline-flex items-center">
        <svg
          width="30"
          height="30"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle cx="11" cy="11" r="11" fill="#e3eaf5" />
          <path
            d="M13.5 7L9.5 11L13.5 15"
            stroke="#1976d2"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
};

export default BackButton;
