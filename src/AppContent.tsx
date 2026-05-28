// src/AppContent.tsx
import React, { useCallback, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { loadStats, hasSeenStats, markStatsSeen, type Mode, type Stats } from "./utils/stats";
import { loadGameState } from "./utils/gameState";
import { resetAllDailyGameStatesIfNewDay } from "./utils/dailyReset";
import { useTodayKey } from "./hooks/useTodayKey";
import { Game } from "./components/Game";
import HelpPage from "./components/HelpModal";
import DailyChallenges from "./pages/DailyChallenges";
import { StatsModal } from "./components/StatsModal";
import Home from "./components/Home";
import { MainMenu } from "./components/MainMenu";

import CustomRoomFlow from "./components/CustomRoom/CustomRoomFlow";
import CustomRoomGame from "./components/CustomRoom/CustomRoomGame";
import CustomRoomCreatePage from "./pages/CustomRoomCreatePage";
import CustomRoomJoinPage from "./pages/CustomRoomJoinPage";
import AboutPage from "./pages/AboutPage";
import { resolveModeFromPath, getModeMaxTries, isDailyMode } from "./utils/modeLabels";

function getTodayGameResult(mode: Mode, today: string): "win" | "lose" | null {
  if (mode !== "casual" && mode !== "desafio" && mode !== "codigo-mestre") {
    return null;
  }

  const saved = loadGameState(mode);
  const maxTries = getMaxTriesForMode(mode);

  if (saved.date !== today || saved.guesses.length === 0) return null;
  if (saved.hasWon) return "win";
  if (saved.guesses.length >= maxTries) return "lose";
  return null;
}

function getMaxTriesForMode(mode: Mode): number {
  if (isDailyMode(mode)) return getModeMaxTries(mode);
  return Infinity;
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const pathSegment = location.pathname.replace(/^\//, "").split("/")[0] ?? "";
  const activeDailyMode = resolveModeFromPath(pathSegment);

  const [showStats, setShowStats] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const [statsByMode, setStatsByMode] = useState<Record<Mode, Stats>>({
    casual: loadStats("casual"),
    desafio: loadStats("desafio"),
    custom: loadStats("custom"),
    "codigo-mestre": loadStats("codigo-mestre"),
  });

  const handleDayChange = useCallback(() => {
    resetAllDailyGameStatesIfNewDay();
    setStatsByMode({
      casual: loadStats("casual"),
      desafio: loadStats("desafio"),
      custom: loadStats("custom"),
      "codigo-mestre": loadStats("codigo-mestre"),
    });
    setShowStats(false);
    setGameResult(null);
  }, []);

  const today = useTodayKey(handleDayChange);

  const closeStats = useCallback(() => {
    if (activeDailyMode) {
      markStatsSeen(activeDailyMode, today);
    }
    setShowStats(false);
  }, [activeDailyMode, today]);

  const openStats = useCallback(
    (result: "win" | "lose" | null = null) => {
      if (!activeDailyMode) return;

      setStatsByMode((prev) => ({
        ...prev,
        [activeDailyMode]: loadStats(activeDailyMode),
      }));
      setGameResult(result ?? getTodayGameResult(activeDailyMode, today));
      setShowStats(true);
    },
    [activeDailyMode, today]
  );

  const handleWin = (newStats: Stats, result?: "win" | "lose") => {
    if (!activeDailyMode) return;

    setStatsByMode((prev) => ({ ...prev, [activeDailyMode]: newStats }));
    setGameResult(result ?? getTodayGameResult(activeDailyMode, today));
    setShowStats(true);
  };

  React.useEffect(() => {
    if (!activeDailyMode) {
      setShowStats(false);
      setGameResult(null);
      return;
    }

    const stats = loadStats(activeDailyMode);
    setStatsByMode((prev) => ({ ...prev, [activeDailyMode]: stats }));

    const result = getTodayGameResult(activeDailyMode, today);
    if (result !== null && !hasSeenStats(activeDailyMode, today)) {
      setGameResult(result);
      setShowStats(true);
      return;
    }

    setShowStats(false);
    setGameResult(null);
  }, [activeDailyMode, today]);

  return (
    <>
      <MainMenu />
      {showStats && activeDailyMode && (
        <StatsModal
          stats={statsByMode[activeDailyMode]}
          maxTries={getMaxTriesForMode(activeDailyMode)}
          onClose={closeStats}
          gameResult={gameResult}
        />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/desafios" element={<DailyChallenges />} />
        <Route
          path="/cores"
          element={
            <Game
              mode="casual"
              onWin={handleWin}
              onOpenStats={() => openStats()}
            />
          }
        />
        <Route path="/casual" element={<Navigate to="/cores" replace />} />
        <Route
          path="/contagem"
          element={
            <Game
              mode="desafio"
              onWin={handleWin}
              onOpenStats={() => openStats()}
            />
          }
        />
        <Route path="/desafio" element={<Navigate to="/contagem" replace />} />
        <Route
          path="/codigo-mestre"
          element={
            <Game
              mode="codigo-mestre"
              onWin={handleWin}
              onOpenStats={() => openStats()}
            />
          }
        />
        {/* Página dedicada para criar sala customizada */}
        <Route
          path="/custom/criar"
          element={
            <div className="custom-page-wrapper">
              <CustomRoomCreatePage />
            </div>
          }
        />
        {/* Página dedicada para entrar/listar salas customizadas */}
        <Route
          path="/custom/entrar"
          element={
            <div className="custom-page-wrapper">
              <CustomRoomJoinPage />
            </div>
          }
        />
        {/* Rota custom com fluxo de entrar/lobby/listar */}
        <Route
          path="/custom"
          element={
            <div className="custom-page-wrapper">
              <CustomRoomFlow />
            </div>
          }
        />
        {/* Rota para lobby de sala permanente por ID */}
        <Route
          path="/custom/lobby/:roomId"
          element={
            <div className="custom-page-wrapper">
              <CustomRoomFlow />
            </div>
          }
        />
        {/* Rota para tela de jogo custom */}
        <Route
          path="/custom/game/:roomId"
          element={
            <div className="custom-page-wrapper">
              <CustomRoomGame />
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default AppContent;
