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

  if (mode === "casual") {
    if (isPlaceholder) {
      // Renderiza 4 caixas claras
      // Usar cor do tema manualmente para o placeholder
      return (
        <GuessRowContainer>
          {[0, 1, 2, 3].map((i) => (
            <GuessDigit
              key={i}
              color="#dee2e6"
              textColor="#999"
              style={
                typeof window !== "undefined" &&
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                  ? { backgroundColor: "#3e3e53" }
                  : undefined
              }
            >
              &nbsp;
            </GuessDigit>
          ))}
        </GuessRowContainer>
      );
    }

    // se não for placeholder, renderiza feedback normal
    const statuses = getStatuses(guess, code);
    // Efeito cascata: cada dígito aparece com delay incremental
    const STAGGER = 80; // ms
    return (
      <GuessRowContainer $animateEntry={animateEntry}>
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
              $animateEntry={animateEntry}
              $entryDelay={animateEntry && staggerEntry ? idx * STAGGER : 0}
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
