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

export const GuessRow: React.FC<Props> = ({
  guess,
  code,
  mode,
  animate,
  animationType,
}) => {
  // placeholder: nenhum dígito ainda
  const isPlaceholder = guess.every((d) => d === "");

  if (mode === "casual") {
    if (isPlaceholder) {
      // Renderiza 4 caixas claras
      return (
        <GuessRowContainer>
          {[0, 1, 2, 3].map((i) => (
            <GuessDigit
              key={i}
              color={"#f0f0f0"} // fundo claro para placeholder
              textColor={"#999"} // dígito (vazio) em cinza
            >
              &nbsp;
            </GuessDigit>
          ))}
        </GuessRowContainer>
      );
    }

    // se não for placeholder, renderiza feedback normal
    const statuses = getStatuses(guess, code);
    return (
      <GuessRowContainer>
        {guess.map((digit, idx) => {
          let bg = "#dee2e6";
          if (statuses[idx] === "correct") bg = "#28a745";
          else if (statuses[idx] === "present") bg = "#ffc107";

          return (
            <GuessDigit
              key={idx}
              color={bg}
              $animate={animate}
              $animationType={animationType}
            >
              {digit}
            </GuessDigit>
          );
        })}
      </GuessRowContainer>
    );
  }

  // modo desafio continua igual
  const { correctPlace, correctDigit } = getFeedback(guess, code);
  return (
    <HardModeText>
      {guess.join(" ")} — {correctPlace} no lugar certo, {correctDigit} fora do
      lugar.
    </HardModeText>
  );
};
