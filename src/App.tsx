import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme, darkTheme } from "./theme";
import { Game } from "./components/Game";
import {
  ActiveIconButton,
  PlainIconButton,
  ThemeToggleWrapper,
} from "./styles/AppStyles";
import { HelpModal } from "./components/HelpModal";

import { Header, NavGroup, ModeToggleButton } from "./styles/AppStyles";
import { loadStats, type Mode, type Stats } from "./utils/stats";
import { StatsModal } from "./components/StatsModal";
import { BarChartIcon, MoonIcon, SunIcon } from "lucide-react";

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [mode, setMode] = useState<"easy" | "hard" | "practice">("easy");
  const activeTheme = isDark ? darkTheme : theme;
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsByMode, setStatsByMode] = useState<Record<Mode, Stats>>({
    easy: loadStats("easy"),
    hard: loadStats("hard"),
    practice: loadStats("practice"), // retorna default
  });
  console.log("[App] Vou renderizar <Game> com mode=", mode);
  const handleWin = (newStats: Stats) => {
    setStatsByMode((prev) => ({
      ...prev,
      [mode]: newStats,
    }));
    setShowStats(true);
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyles />
      <Header>
        <NavGroup>
          <ModeToggleButton
            $active={mode === "easy"}
            onClick={() => setMode("easy")}
          >
            Casual
          </ModeToggleButton>
          <ModeToggleButton
            $active={mode === "hard"}
            onClick={() => setMode("hard")}
          >
            Desafio
          </ModeToggleButton>{" "}
          <ModeToggleButton
            $active={mode === "practice"}
            disabled
            title="Em breve"
          >
            Custom
          </ModeToggleButton>
        </NavGroup>

        <NavGroup>
          <ActiveIconButton
            onClick={() => setShowStats(true)}
            aria-label="Estatísticas"
          >
            <BarChartIcon />
          </ActiveIconButton>
          <PlainIconButton
            onClick={() => setShowHelp(true)}
            aria-label="Como jogar"
          >
            ?
          </PlainIconButton>
          <ThemeToggleWrapper>
            <ActiveIconButton
              active={isDark}
              onClick={() => setIsDark((d) => !d)}
              aria-label="Alternar tema"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </ActiveIconButton>
          </ThemeToggleWrapper>
        </NavGroup>
      </Header>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <Game key={mode} mode={mode} onWin={handleWin} />
      {showStats && (
        <StatsModal
          stats={statsByMode[mode]}
          onClose={() => setShowStats(false)}
        />
      )}
    </ThemeProvider>
  );
};

export default App;
