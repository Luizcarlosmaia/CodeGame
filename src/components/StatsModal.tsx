// src/components/StatsModal.tsx
import React from "react";
import {
  Overlay,
  ModalBox,
  ModalHeader,
  CloseButton,
} from "../styles/AppStyles";
import {
  StatGrid,
  StatCard,
  BarChart,
  BarRow,
  BarLabel,
  BarFill,
} from "../styles/StatsStyles";
import type { Stats } from "../utils/stats";

interface Props {
  stats: Stats;
  maxTries: number;
  onClose: () => void;
}

export const StatsModal: React.FC<Props> = ({ stats, maxTries, onClose }) => {
  const totalGames = stats.totalGames;
  const winRate =
    totalGames > 0 ? Math.round((stats.totalWins / totalGames) * 100) : 0;

  // Pegar apenas de 1 até maxTries
  const entries = Array.from({ length: maxTries }, (_, i) => {
    const tries = i + 1;
    const count = stats.distribution[tries] || 0;
    const pct = totalGames ? (count / totalGames) * 100 : 0;
    return { tries, count, pct };
  });

  // Se for Hard e muitas barras, usar 2 colunas
  const twoCols = maxTries > 8;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Progresso</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <StatGrid>
          <StatCard>
            <span className="label">Jogos</span>
            <span className="value">{totalGames}</span>
          </StatCard>
          <StatCard>
            <span className="label">Vitórias</span>
            <span className="value">{winRate}%</span>
          </StatCard>
          <StatCard>
            <span className="label">Streak</span>
            <span className="value">{stats.currentStreak}</span>
          </StatCard>
          <StatCard>
            <span className="label">Melhor streak</span>
            <span className="value">{stats.bestStreak}</span>
          </StatCard>
        </StatGrid>

        <h3>Distribuição de Tentativas</h3>
        <BarChart
          style={{
            display: "grid",
            gridTemplateColumns: twoCols ? "1fr 1fr" : "1fr",
            gap: "0.5rem 1rem",
          }}
        >
          {entries.map(({ tries, count, pct }) => (
            <BarRow key={tries} style={{ alignItems: "center" }}>
              <BarLabel>{tries}</BarLabel>
              <BarFill style={{ width: `${pct}%` }}>{count}</BarFill>
            </BarRow>
          ))}
        </BarChart>
      </ModalBox>
    </Overlay>
  );
};
