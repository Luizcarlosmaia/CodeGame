// src/AppContent.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { loadStats, type Mode, type Stats } from "./utils/stats";
import { Game } from "./components/Game";
import { HelpModal } from "./components/HelpModal";
import { StatsModal } from "./components/StatsModal";
import { Header } from "./components/Header";

interface Props {
  isDark: boolean;
  onToggleDark: () => void;
}

const AppContent: React.FC<Props> = ({ isDark, onToggleDark }) => {
  const location = useLocation();
  const mode = (location.pathname.replace("/", "") as Mode) || "casual";

  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsByMode, setStatsByMode] = useState<Record<Mode, Stats>>({
    casual: loadStats("casual"),
    desafio: loadStats("desafio"),
    custom: loadStats("custom"),
  });

  const handleWin = (newStats: Stats) => {
    setStatsByMode((prev) => ({ ...prev, [mode]: newStats }));
    setShowStats(true);
  };

  return (
    <>
      <Header
        mode={mode}
        onModeChange={() => {}}
        onShowStats={() => setShowStats(true)}
        onShowHelp={() => setShowHelp(true)}
        isDark={isDark}
        onToggleDark={onToggleDark}
      />

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showStats && (
        <StatsModal
          stats={statsByMode[mode]}
          maxTries={mode === "casual" ? 6 : mode === "desafio" ? 15 : Infinity}
          onClose={() => setShowStats(false)}
        />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/casual" replace />} />
        <Route
          path="/casual"
          element={<Game mode="casual" onWin={handleWin} />}
        />
        <Route
          path="/desafio"
          element={<Game mode="desafio" onWin={handleWin} />}
        />
        <Route
          path="/custom"
          element={<Game mode="custom" onWin={handleWin} />}
        />
      </Routes>
    </>
  );
};

export default AppContent;
