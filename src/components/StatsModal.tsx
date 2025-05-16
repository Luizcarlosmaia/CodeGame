// src/components/StatsModal.tsx
import React, { useState, useEffect } from "react";
import {
  Overlay,
  ModalBox,
  ModalHeader,
  CloseButton,
} from "../styles/AppStyles";
import type { Stats } from "../utils/stats";
import {
  StatGrid,
  StatCard,
  BarChart,
  BarRow,
  BarLabel,
  BarFill,
} from "../styles/StatsStyles";

interface Props {
  stats: Stats;
  onClose: () => void;
}

export const StatsModal: React.FC<Props> = ({ stats, onClose }) => {
  // 1) Função utilitária para formatar segundos em HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // 2) Estado e efeito para contagem regressiva
  const [remaining, setRemaining] = useState(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalGames = Object.values(stats.distribution).reduce(
    (a, b) => a + b,
    0
  );
  const winRate =
    totalGames > 0 ? Math.round((stats.totalWins / totalGames) * 100) : 0;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Progresso</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {/* Grid principal */}
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

        {/* Cronômetro */}
        <p
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            fontSize: "0.9rem",
          }}
        >
          Próximo desafio em <strong>{formatTime(remaining)}</strong>
        </p>

        <h3 style={{ textAlign: "center", margin: "0 0 0.5rem" }}>
          Distribuição de tentativas
        </h3>
        <BarChart>
          {Object.entries(stats.distribution).map(([tries, count]) => {
            const pct = totalGames ? (count / totalGames) * 100 : 0;
            return (
              <BarRow key={tries}>
                <BarLabel>{tries}</BarLabel>
                <BarFill style={{ width: `${pct}%` }}>{count}</BarFill>
              </BarRow>
            );
          })}
        </BarChart>
      </ModalBox>
    </Overlay>
  );
};
