import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButtonStyled } from "./BackButton.styles";

interface BackButtonProps {
  to?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

const BackButton: React.FC<BackButtonProps> = ({
  to = "/home",
  ariaLabel = "Voltar",
  style,
}) => {
  const navigate = useNavigate();
  return (
    <BackButtonStyled
      type="button"
      onClick={() => navigate(to)}
      aria-label={ariaLabel}
      style={style}
    >
      <span
        className="back-arrow"
        style={{ display: "flex", alignItems: "center", marginRight: 4 }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
    </BackButtonStyled>
  );
};

export default BackButton;
