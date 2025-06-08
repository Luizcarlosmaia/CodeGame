// src/components/Header.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Header as HeaderWrapper,
  NavGroup,
  ModeToggleButton,
  ActiveIconButton,
  PlainIconButton,
  ThemeToggleWrapper,
} from "../styles/AppStyles";
import { BarChartIcon, MoonIcon, SunIcon } from "lucide-react";
import { type Mode } from "../utils/stats";

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onShowStats: () => void;
  onShowHelp: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const Header: React.FC<Props> = ({
  mode,
  onModeChange,
  onShowStats,
  isDark,
  onToggleDark,
}) => (
  <HeaderWrapper>
    <NavGroup>
      {(["casual", "desafio", "custom"] as Mode[]).map((m) => (
        <NavLink
          key={m}
          to={`/${m}`}
          end
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={() => onModeChange(m)}
        >
          <ModeToggleButton $active={mode === m} disabled={false}>
            {m === "casual" ? "Casual" : m === "desafio" ? "Desafio" : "Custom"}
          </ModeToggleButton>
        </NavLink>
      ))}
    </NavGroup>

    <NavGroup>
      {mode !== "custom" && (
        <ActiveIconButton onClick={onShowStats} aria-label="Estatísticas">
          <BarChartIcon />
        </ActiveIconButton>
      )}
      <NavLink to="/ajuda" style={{ textDecoration: "none" }}>
        <PlainIconButton as="span" aria-label="Como jogar">
          ?
        </PlainIconButton>
      </NavLink>
      <ThemeToggleWrapper>
        <ActiveIconButton
          active={isDark}
          onClick={onToggleDark}
          aria-label="Alternar tema"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </ActiveIconButton>
      </ThemeToggleWrapper>
    </NavGroup>
  </HeaderWrapper>
);
