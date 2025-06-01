// Componente para animar a largura da barra
const AnimatedBarFill: React.FC<{
  width: number;
  delay: number;
  children: React.ReactNode;
}> = ({ width, delay, children }) => {
  const [animatedWidth, setAnimatedWidth] = React.useState(0);
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedWidth(width);
    }, delay);
    return () => clearTimeout(timeout);
  }, [width, delay]);
  return <BarFill $width={animatedWidth}>{children}</BarFill>;
};
// src/components/StatsModal.tsx
import React, { useEffect, useState } from "react";
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
  playedToday?: boolean;
}

// Utilitário para calcular o tempo restante até o próximo reset (meia-noite local)
function getTimeToNextReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0); // próxima meia-noite
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

export const StatsModal: React.FC<Props> = ({
  stats,
  maxTries,
  onClose,
  playedToday,
}) => {
  // Cronômetro para o próximo reset diário
  const [timer, setTimer] = useState(getTimeToNextReset());
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getTimeToNextReset());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const totalGames = stats.totalGames;
  const winRate =
    totalGames > 0 ? Math.round((stats.totalWins / totalGames) * 100) : 0;

  // Pegar apenas tentativas que realmente ocorreram (não mostrar barras "vazias" após a maior tentativa já usada)
  const maxTentativasUsadas = Math.max(
    ...Object.keys(stats.distribution).map((k) => Number(k)),
    0
  );
  const limite = Math.max(maxTentativasUsadas, 1, Math.min(maxTries, 6));

  const entries = Array.from({ length: limite }, (_, i) => {
    const tries = i + 1;
    const count = stats.distribution[tries] || 0;
    return { tries, count };
  });

  // Novo: maior valor para normalizar largura das barras
  const maxCount = Math.max(...entries.map((e) => e.count), 1);

  // Se for Hard e muitas barras, usar 2 colunas
  const twoCols = maxTries > 8;

  // Determina se foi vitória, derrota ou só estatística
  let result: "win" | "lose" | null = null;
  // Só mostra mensagem se jogou hoje
  if (playedToday) {
    if (totalGames > 0) {
      if (stats.currentStreak > 0 && stats.totalWins === totalGames) {
        result = "win";
      } else if (stats.currentStreak === 0 && winRate < 100) {
        result = "lose";
      }
    }
  }

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Progresso</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {/* Destaque visual de vitória/derrota */}
        {result === "win" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              margin: "0.2em 0 0.7em 0",
              padding: "0.35em 0.7em 0.35em 0.5em",
              background: "#e6f7ec",
              color: "#217a4b",
              borderRadius: 8,
              fontSize: "1.04em",
              fontWeight: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              minHeight: 0,
              maxWidth: 320,
              marginLeft: "auto",
              marginRight: "auto",
              transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <span style={{ fontSize: "1.5em", marginRight: 6, lineHeight: 1 }}>
              🎉
            </span>
            <span>Parabéns! Você acertou o código!</span>
          </div>
        )}
        {result === "lose" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              margin: "0.2em 0 0.7em 0",
              padding: "0.35em 0.7em 0.35em 0.5em",
              background: "#fbeaea",
              color: "#a13a3a",
              borderRadius: 8,
              fontSize: "1.01em",
              fontWeight: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              minHeight: 0,
              maxWidth: 320,
              marginLeft: "auto",
              marginRight: "auto",
              transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <span style={{ fontSize: "1.5em", marginRight: 6, lineHeight: 1 }}>
              😞
            </span>
            <span>Não foi dessa vez!</span>
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            margin: "0.5em 0 1em 0",
            fontSize: "1.05em",
            color: "#153972",
            fontWeight: 500,
          }}
        >
          Próximo código em:
          <span
            style={{
              marginLeft: 8,
              fontVariantNumeric: "tabular-nums",
              fontWeight: 700,
            }}
          >
            {String(timer.hours).padStart(2, "0")}:
            {String(timer.minutes).padStart(2, "0")}:
            {String(timer.seconds).padStart(2, "0")}
          </span>
        </div>

        <StatGrid
          style={{
            width: "100%",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          <StatCard style={{ textAlign: "center", width: "100%" }}>
            <span className="label">Jogos</span>
            <span className="value">{totalGames}</span>
          </StatCard>
          <StatCard style={{ textAlign: "center", width: "100%" }}>
            <span className="label">Vitórias</span>
            <span className="value">{winRate}%</span>
          </StatCard>
          <StatCard style={{ textAlign: "center", width: "100%" }}>
            <span className="label">Sequência de Vitórias</span>
            <span className="value">{stats.currentStreak}</span>
          </StatCard>
          <StatCard style={{ textAlign: "center", width: "100%" }}>
            <span className="label">Recorde de Sequência</span>
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
          {entries.map(({ tries, count }, idx) => {
            // largura proporcional ao maior valor, mínimo 8%
            const width =
              maxCount > 0 ? Math.max((count / maxCount) * 100, 8) : 8;
            const delay = 200 + idx * 120;
            return (
              <BarRow key={tries} style={{ alignItems: "center" }}>
                <BarLabel>{tries}</BarLabel>
                <AnimatedBarFill width={width} delay={delay}>
                  {count}
                </AnimatedBarFill>
              </BarRow>
            );
          })}
        </BarChart>
      </ModalBox>
    </Overlay>
  );
};
