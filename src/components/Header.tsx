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
  onShowHelp,
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
      <ActiveIconButton onClick={onShowStats} aria-label="Estatísticas">
        <BarChartIcon />
      </ActiveIconButton>
      <PlainIconButton onClick={onShowHelp} aria-label="Como jogar">
        ?
      </PlainIconButton>
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
