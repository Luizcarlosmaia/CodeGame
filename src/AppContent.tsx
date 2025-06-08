// src/AppContent.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { loadStats, type Mode, type Stats } from "./utils/stats";
import { Game } from "./components/Game";
import HelpPage from "./components/HelpModal";
import DailyChallenges from "./pages/DailyChallenges";
import { StatsModal } from "./components/StatsModal";
import Home from "./components/Home";
import { MainMenu } from "./components/MainMenu";

import styled from "styled-components";
import CustomRoomFlow from "./components/CustomRoom/CustomRoomFlow";
import CustomRoomGame from "./components/CustomRoom/CustomRoomGame";
import CustomRoomCreatePage from "./pages/CustomRoomCreatePage";
import CustomRoomJoinPage from "./pages/CustomRoomJoinPage";
const CustomPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 90vh;
  width: 100%;
  background: #f7f9fa;
  padding: 0.1rem;
  box-sizing: border-box;
  @media (max-width: 899px) {
    padding: 0.2rem;
  }
`;

function isModeFinished(mode: Mode): boolean {
  if (mode !== "casual" && mode !== "desafio") return false;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const maxTries = mode === "casual" ? 6 : 15;
  try {
    const gameState = JSON.parse(
      localStorage.getItem(`codeGameState-${mode}`) || "{}"
    );
    if (gameState.date !== today) return false;
    if (!Array.isArray(gameState.guesses) || gameState.guesses.length === 0)
      return false;
    if (gameState.hasWon === true) return true;
    if (gameState.guesses.length >= maxTries) return true;
    return false;
  } catch {
    return false;
  }
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const mode = (location.pathname.replace("/", "") as Mode) || "casual";

  // const [showHelp, setShowHelp] = useState(false);
  // const [helpTutorial, setHelpTutorial] = useState(false);
  // Sempre força a checagem ao montar (corrige bug de não mostrar ao recarregar)
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

  // Sempre que o modo mudar, verifica se deve mostrar o modal automaticamente
  React.useEffect(() => {
    const stats = loadStats(mode);
    setStatsByMode((prev) => ({ ...prev, [mode]: stats }));
    // Só mostra automaticamente se o jogo do dia foi finalizado
    if (isModeFinished(mode)) {
      setShowStats(true);
    }
  }, [mode]);

  // Observa mudanças no localStorage do gameState do modo atual para exibir o modal automaticamente após vitória/derrota ou recarregamento
  React.useEffect(() => {
    function checkGameState() {
      // Só abre automaticamente se o jogo do dia foi finalizado
      if (isModeFinished(mode)) {
        setShowStats(true);
      }
    }
    // storage event só dispara entre abas, então também checa por polling
    window.addEventListener("storage", checkGameState);
    const interval = setInterval(checkGameState, 1000);
    return () => {
      window.removeEventListener("storage", checkGameState);
      clearInterval(interval);
    };
  }, [mode]);

  // Exibe o tutorial automaticamente se nunca jogou
  // (Removido: agora só mostra o modal de ajuda ao clicar no botão)

  return (
    <>
      <MainMenu />
      {showStats && (
        <StatsModal
          stats={statsByMode[mode]}
          maxTries={mode === "casual" ? 6 : mode === "desafio" ? 15 : Infinity}
          onClose={() => setShowStats(false)}
          playedToday={
            // Só considera que jogou se houve pelo menos um palpite hoje
            Array.isArray(statsByMode[mode]?.distribution)
              ? Object.values(statsByMode[mode]?.distribution || {}).some(
                  (v) => v > 0
                )
              : (statsByMode[mode]?.totalGames ?? 0) > 0
          }
        />
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/desafios" element={<DailyChallenges />} />
        <Route
          path="/casual"
          element={<Game mode="casual" onWin={handleWin} />}
        />
        <Route
          path="/desafio"
          element={<Game mode="desafio" onWin={handleWin} />}
        />
        {/* Página dedicada para criar sala customizada */}
        <Route
          path="/custom/criar"
          element={
            <CustomPageWrapper>
              <CustomRoomCreatePage />
            </CustomPageWrapper>
          }
        />
        {/* Página dedicada para entrar/listar salas customizadas */}
        <Route
          path="/custom/entrar"
          element={
            <CustomPageWrapper>
              <CustomRoomJoinPage />
            </CustomPageWrapper>
          }
        />
        {/* Rota custom com fluxo de entrar/lobby/listar */}
        <Route
          path="/custom"
          element={
            <CustomPageWrapper>
              <CustomRoomFlow />
            </CustomPageWrapper>
          }
        />
        {/* Rota para lobby de sala permanente por ID */}
        <Route
          path="/custom/lobby/:roomId"
          element={
            <CustomPageWrapper>
              <CustomRoomFlow />
            </CustomPageWrapper>
          }
        />
        {/* Rota para tela de jogo custom */}
        <Route
          path="/custom/game/:roomId"
          element={
            <CustomPageWrapper>
              <CustomRoomGame />
            </CustomPageWrapper>
          }
        />
      </Routes>
    </>
  );
};

export default AppContent;
