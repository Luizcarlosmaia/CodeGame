import React from "react";
import {
  getCodigoMestreStatuses,
  type CodigoMestreStatus,
} from "../utils/getFeedback";
import { cn } from "../lib/cn";

export function getCodigoMestreArrowClass(
  status: CodigoMestreStatus,
  arrow: "up" | "down"
) {
  if (status === "empty") return "game-codigo-mestre-arrow-muted";
  if (status === "correct") return "game-codigo-mestre-arrow-correct";

  if (status === "higher") {
    return arrow === "up"
      ? "game-codigo-mestre-arrow-active"
      : "game-codigo-mestre-arrow-muted";
  }

  return arrow === "down"
    ? "game-codigo-mestre-arrow-active"
    : "game-codigo-mestre-arrow-muted";
}

function formatGuessValue(value: string): string {
  if (!value) return "—";
  return value.padStart(2, "0");
}

interface Props {
  guesses: string[][];
  secretCode: string[];
  maxTries: number;
  hasWon: boolean;
  isLost: boolean;
}

export const CodigoMestreFeedback: React.FC<Props> = ({
  guesses,
  secretCode,
  maxTries,
  hasWon,
  isLost,
}) => {
  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;
  const statuses = lastGuess
    ? getCodigoMestreStatuses(lastGuess, secretCode)
    : null;
  const correctCount = statuses?.filter((s) => s === "correct").length ?? 0;

  return (
    <div className="game-codigo-mestre-panel">
      <div className="game-codigo-mestre-progress" aria-hidden>
        {Array.from({ length: maxTries }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "game-codigo-mestre-progress-dot",
              i < guesses.length && "game-codigo-mestre-progress-dot-used",
              hasWon && i === guesses.length - 1 && "game-codigo-mestre-progress-dot-win",
              isLost && i === guesses.length - 1 && "game-codigo-mestre-progress-dot-lose"
            )}
          />
        ))}
      </div>

      {!lastGuess ? (
        <div className="game-codigo-mestre-panel-empty">
          <p className="game-codigo-mestre-panel-title">
            Descubra o código de 4 valores
          </p>
          <p className="game-codigo-mestre-panel-subtitle">
            Cada valor vai de 00 a 99. Envie um palpite para ver as setas de
            dica.
          </p>
          <div className="game-codigo-mestre-panel-hint">
            <span className="game-codigo-mestre-panel-hint-icon" aria-hidden>
              ↑↓
            </span>
            <span>
              {maxTries} tentativas · sem histórico · só as setas guiam você
            </span>
          </div>
        </div>
      ) : (
        <div className="game-codigo-mestre-panel-result">
          <div className="game-codigo-mestre-panel-result-head">
            <span className="game-codigo-mestre-panel-result-label">
              Palpite {guesses.length}
            </span>
            <span className="game-codigo-mestre-panel-result-meta">
              {correctCount === 4
                ? "Código completo!"
                : `${correctCount} de 4 certos`}
            </span>
          </div>

          <div className="game-codigo-mestre-feedback-grid">
            {lastGuess.map((value, i) => (
              <div key={i} className="game-codigo-mestre-feedback-cell">
                <span
                  className={cn(
                    "game-codigo-mestre-arrow game-codigo-mestre-arrow-sm",
                    getCodigoMestreArrowClass(statuses![i], "up")
                  )}
                  aria-hidden
                >
                  ↑
                </span>
                <span
                  className={cn(
                    "game-codigo-mestre-feedback-value",
                    statuses![i] === "correct" && "text-success"
                  )}
                >
                  {formatGuessValue(value)}
                </span>
                <span
                  className={cn(
                    "game-codigo-mestre-arrow game-codigo-mestre-arrow-sm",
                    getCodigoMestreArrowClass(statuses![i], "down")
                  )}
                  aria-hidden
                >
                  ↓
                </span>
              </div>
            ))}
          </div>

          {isLost && (
            <div className="game-codigo-mestre-answer">
              <p className="game-codigo-mestre-answer-label">O código era</p>
              <div className="game-codigo-mestre-answer-grid">
                {secretCode.map((value, i) => (
                  <span key={i} className="game-codigo-mestre-answer-digit">
                    {formatGuessValue(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
