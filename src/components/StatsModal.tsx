import React, { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import type { Stats } from "../utils/stats";

interface Props {
  stats: Stats;
  maxTries: number;
  onClose: () => void;
  gameResult?: "win" | "lose" | null;
}

function getTimeToNextReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function AnimatedBarFill({
  width,
  delay,
  count,
  isMax,
}: {
  width: number;
  delay: number;
  count: number;
  isMax: boolean;
}) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedWidth(width), delay);
    return () => clearTimeout(timeout);
  }, [width, delay]);

  return (
    <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-background">
      <div
        className={cn(
          "flex h-full min-w-7 items-center rounded-lg px-2 text-xs font-bold text-white transition-[width] duration-500 ease-out",
          isMax ? "bg-brand" : "bg-brand/70"
        )}
        style={{ width: `${animatedWidth}%` }}
      >
        {count}
      </div>
    </div>
  );
}

export const StatsModal: React.FC<Props> = ({
  stats,
  maxTries,
  onClose,
  gameResult = null,
}) => {
  const [timer, setTimer] = useState(getTimeToNextReset());

  useEffect(() => {
    const interval = setInterval(() => setTimer(getTimeToNextReset()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const totalGames = stats.totalGames;
  const winRate =
    totalGames > 0 ? Math.round((stats.totalWins / totalGames) * 100) : 0;

  const distributionLimit = Number.isFinite(maxTries) ? maxTries : 6;
  const maxTentativasUsadas = Math.max(
    ...Object.keys(stats.distribution).map((k) => Number(k)),
    0
  );
  const limite = Math.max(maxTentativasUsadas, 1, distributionLimit);

  const entries = Array.from({ length: limite }, (_, i) => {
    const tries = i + 1;
    const count = stats.distribution[tries] || 0;
    return { tries, count };
  });

  const maxCount = Math.max(...entries.map((e) => e.count), 1);

  const statCards = [
    { label: "Jogos", value: String(totalGames) },
    { label: "Vitórias", value: `${winRate}%` },
    { label: "Sequência", value: String(stats.currentStreak) },
    { label: "Recorde", value: String(stats.bestStreak) },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="stats-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-modal-title"
      >
        <header className="relative pb-1 pt-1 text-center">
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            Seu progresso
          </span>
          <h2
            id="stats-modal-title"
            className="mt-3 text-2xl font-extrabold tracking-tight text-ink"
          >
            Estatísticas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="game-toolbar-btn absolute right-0 top-0"
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        {gameResult === "win" && (
          <div className="game-result-banner game-result-banner-win mt-4">
            <span className="text-base leading-none">🎉</span>
            <span>Você acertou o código!</span>
          </div>
        )}
        {gameResult === "lose" && (
          <div className="game-result-banner game-result-banner-lose mt-4">
            <span className="text-base leading-none">😞</span>
            <span>Não foi dessa vez!</span>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-center">
          <p className="text-sm font-medium text-ink-muted">Próximo código em</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-brand">
            {String(timer.hours).padStart(2, "0")}:
            {String(timer.minutes).padStart(2, "0")}:
            {String(timer.seconds).padStart(2, "0")}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
          {statCards.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/60 bg-surface px-3 py-3 text-center shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="mb-3 text-center text-sm font-semibold text-ink-soft">
            Distribuição de tentativas
          </h3>
          <div className="space-y-2">
            {entries.map(({ tries, count }, idx) => {
              const width =
                maxCount > 0 ? Math.max((count / maxCount) * 100, count > 0 ? 12 : 8) : 8;
              const delay = 150 + idx * 80;
              return (
                <div key={tries} className="flex items-center gap-2.5">
                  <span className="w-5 text-center text-sm font-bold text-ink-muted">
                    {tries}
                  </span>
                  <AnimatedBarFill
                    width={width}
                    delay={delay}
                    count={count}
                    isMax={count === maxCount && count > 0}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-success mt-5 w-full py-3 text-base"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
