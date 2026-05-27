import React from "react";
import { getFeedback, getStatuses } from "../utils/getFeedback";
import {
  GuessRowContainer,
  GuessDigit,
  HardModeText,
} from "../styles/AppStyles";
import type { Mode } from "../utils/stats";

interface Props {
  guess: string[];
  code: string[];
  mode: Mode;
  attempt: number;
  animate?: boolean;
  animationType?: "win" | "lose";
}

interface GuessRowExtraProps {
  animateEntry?: boolean;
}

interface GuessRowStaggerProps extends GuessRowExtraProps {
  staggerEntry?: boolean;
}

export const GuessRow: React.FC<Props & GuessRowStaggerProps> = ({
  guess,
  code,
  mode,
  animate,
  animationType,
  animateEntry,
  staggerEntry,
}) => {
  // placeholder: nenhum dígito ainda
  const isPlaceholder = guess.every((d) => d === "");

  // Visual para modos com feedback por campo (casual, codigo-mestre)
  if (mode === "casual" || mode === "codigo-mestre") {
    if (isPlaceholder) {
      return (
        <GuessRowContainer>
          {[0, 1, 2, 3].map((i) => (
            <GuessDigit key={i} color="#dee2e6" textColor="#6c757d">
              &nbsp;
            </GuessDigit>
          ))}
        </GuessRowContainer>
      );
    }
    // Para codigo-mestre, normaliza comparação (0-99)
    const normGuess =
      mode === "codigo-mestre" ? guess.map((d) => String(Number(d))) : guess;
    const normCode =
      mode === "codigo-mestre" ? code.map((d) => String(Number(d))) : code;
    const statuses = getStatuses(normGuess, normCode);
    const STAGGER = 80; // ms
    return (
      <GuessRowContainer $animateEntry={animateEntry}>
        {guess.map((digit, idx) => {
          let bg = "#dee2e6";
          const status = statuses[idx];
          if (status === "correct") bg = "#28a745";
          else if (status === "present") bg = "#ffc107";
          return (
            <GuessDigit
              key={idx}
              color={bg}
              $animate={animate}
              $animationType={animationType}
              $animateEntry={animateEntry}
              $entryDelay={animateEntry && staggerEntry ? idx * STAGGER : 0}
              data-status={status}
            >
              {digit}
            </GuessDigit>
          );
        })}
      </GuessRowContainer>
    );
  }
  // Modo desafio (hard): feedback resumido
  const { correctPlace, correctDigit } = getFeedback(guess, code);
  return (
    <HardModeText>
      {guess.join(" ")} — {correctPlace} no lugar certo, {correctDigit} fora do
      lugar.
    </HardModeText>
  );
};
