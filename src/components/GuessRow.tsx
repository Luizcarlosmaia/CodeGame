import React from "react";
import { getFeedback, getStatuses } from "../utils/getFeedback";
import type { GameMode } from "../types";
import {
  GuessRowContainer,
  GuessDigit,
  HardModeText,
} from "../styles/AppStyles";

interface Props {
  guess: string[];
  code: string[];
  mode: GameMode;
  attempt: number;
}

export const GuessRow: React.FC<Props> = ({ guess, code, mode }) => {
  const feedback = getFeedback(guess, code);

  if (mode === "easy") {
    const statuses = getStatuses(guess, code);
    return (
      <GuessRowContainer>
        {guess.map((digit, idx) => {
          let color = "#dee2e6"; // cinza
          if (statuses[idx] === "correct") color = "#28a745"; // verde
          else if (statuses[idx] === "present") color = "#ffc107"; // amarelo

          return (
            <GuessDigit key={idx} color={color}>
              {digit}
            </GuessDigit>
          );
        })}
      </GuessRowContainer>
    );
  }

  return (
    <HardModeText>
      {guess.join(" ")} — {feedback.correctPlace} no lugar certo,{" "}
      {feedback.correctDigit} fora do lugar.
    </HardModeText>
  );
};
