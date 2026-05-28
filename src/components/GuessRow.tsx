import React from "react";
import { getFeedback, getCodigoMestreStatuses, getStatuses } from "../utils/getFeedback";
import { cn } from "../lib/cn";
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

const CASUAL_COLORS = {
  correct: { bg: "#22c55e", text: "#ffffff" },
  present: { bg: "#fbbf24", text: "#181c24" },
  absent: { bg: "#e2e8f0", text: "#64748b" },
  empty: { bg: "transparent", text: "#94a3b8" },
} as const;

function GuessDigitBox({
  bg,
  textColor,
  children,
  animate,
  animationType,
  animateEntry,
  entryDelay = 0,
  isCasual = false,
}: {
  bg: string;
  textColor?: string;
  children: React.ReactNode;
  animate?: boolean;
  animationType?: "win" | "lose";
  animateEntry?: boolean;
  entryDelay?: number;
  isCasual?: boolean;
}) {
  if (isCasual) {
    return (
      <div
        className={cn(
          "guess-digit-casual",
          animate && animationType === "win" && "animate-guess-win",
          animate && animationType === "lose" && "animate-guess-lose",
          animateEntry && "animate-guess-entry"
        )}
        style={{
          backgroundColor: bg,
          color: textColor ?? "#181c24",
          animationDelay: animateEntry ? `${entryDelay}ms` : undefined,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "guess-digit",
        animate && animationType === "win" && "animate-guess-win",
        animate && animationType === "lose" && "animate-guess-lose",
        animateEntry && "animate-guess-entry"
      )}
      style={{
        backgroundColor: bg,
        color: textColor ?? "#000",
        animationDelay: animateEntry ? `${entryDelay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function getCasualColors(status: "correct" | "present" | "absent") {
  if (status === "correct") return CASUAL_COLORS.correct;
  if (status === "present") return CASUAL_COLORS.present;
  return CASUAL_COLORS.absent;
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
  const isCasual = mode === "casual";
  const isPlaceholder = guess.every((d) => d === "");
  const gapClass = isCasual ? "gap-2 sm:gap-2.5" : "gap-1 lg:gap-3";
  const rowClass = isCasual
    ? "flex shrink-0 flex-nowrap justify-center"
    : "flex flex-wrap justify-center";

  if (mode === "casual" || mode === "codigo-mestre") {
    if (isPlaceholder) {
      if (isCasual || mode === "codigo-mestre") {
        return (
          <div className={cn(rowClass, gapClass)}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="guess-slot-empty-casual" aria-hidden />
            ))}
          </div>
        );
      }

      return (
        <div className={cn("flex flex-wrap justify-center", gapClass)}>
          {[0, 1, 2, 3].map((i) => (
            <GuessDigitBox key={i} bg="#dee2e6" textColor="#6c757d">
              &nbsp;
            </GuessDigitBox>
          ))}
        </div>
      );
    }

    const normGuess =
      mode === "codigo-mestre" ? guess.map((d) => String(Number(d))) : guess;
    const normCode =
      mode === "codigo-mestre" ? code.map((d) => String(Number(d))) : code;
    const statuses =
      mode === "codigo-mestre"
        ? getCodigoMestreStatuses(normGuess, normCode)
        : getStatuses(normGuess, normCode);
    const STAGGER = 80;

    return (
      <div
        className={cn(
          rowClass,
          gapClass,
          animateEntry && "animate-guess-row-entry"
        )}
      >
        {guess.map((digit, idx) => {
          const status = statuses[idx];
          const colors = isCasual
            ? getCasualColors(status as "correct" | "present" | "absent")
            : mode === "codigo-mestre"
              ? status === "correct"
                ? { bg: "#22c55e", text: "#ffffff" }
                : { bg: "#e2e8f0", text: "#64748b" }
              : {
                  bg:
                    status === "correct"
                      ? "#28a745"
                      : status === "present"
                        ? "#ffc107"
                        : "#dee2e6",
                  text: "#000",
                };

          return (
            <GuessDigitBox
              key={idx}
              bg={colors.bg}
              textColor={colors.text}
              animate={animate}
              animationType={animationType}
              animateEntry={animateEntry}
              entryDelay={animateEntry && staggerEntry ? idx * STAGGER : 0}
              isCasual={isCasual || mode === "codigo-mestre"}
            >
              {digit}
            </GuessDigitBox>
          );
        })}
      </div>
    );
  }

  const { correctPlace, correctDigit } = getFeedback(guess, code);
  return (
    <p className="text-sm text-primary lg:text-base">
      {guess.join(" ")} — {correctPlace} no lugar certo, {correctDigit} fora do
      lugar.
    </p>
  );
};
