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
      return (
        <GuessRowContainer>
          {[0, 1, 2, 3].map((i) => (
            <GuessDigit
              key={i}
              color="#dee2e6" // igual ao theme.colors.gray no tema claro
              textColor="#6c757d" // igual ao theme.colors.grayText no tema claro
              // No dark, GuessDigit já usa cor do tema, então não precisa forçar via style
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
