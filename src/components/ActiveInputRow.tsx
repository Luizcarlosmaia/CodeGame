import React, { useState } from "react";
import { getStatuses } from "../utils/getFeedback";
import { cn } from "../lib/cn";

interface ActiveInputRowProps {
  inputDigits: string[];
  secretCode: string[];
  isCodigoMestre: boolean;
  onChange: (val: string, idx: number) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  hasWon: boolean;
  isLost: boolean;
  guessesLength?: number;
  modoVisual?: boolean;
  shakeInput?: boolean;
  variant?: "default" | "casual";
}

function arrowColor(
  status: "correct" | "present" | "absent",
  arrow: "up" | "down"
) {
  if (status === "correct") return "text-[#217a4b]";
  if (status === "present") return arrow === "up" ? "text-[#bfa100]" : "text-[#222]";
  return "text-[#bbb]";
}

export const ActiveInputRow: React.FC<ActiveInputRowProps> = ({
  inputDigits,
  secretCode,
  isCodigoMestre,
  onChange,
  inputRefs,
  hasWon,
  isLost,
  guessesLength = 0,
  modoVisual = false,
  shakeInput = false,
  variant = "default",
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const isCasual = variant === "casual";

  const showFeedback =
    (inputDigits.every((d) => d && d !== "") && guessesLength > 0) ||
    hasWon ||
    isLost;

  const statuses =
    showFeedback &&
    Array.isArray(inputDigits) &&
    Array.isArray(secretCode) &&
    inputDigits.length === 4 &&
    secretCode.length === 4
      ? getStatuses(inputDigits, secretCode)
      : Array(4).fill("absent");

  const handleInputChange = (val: string, idx: number) => {
    let newVal = val.replace(/\D/g, "");
    if (isCodigoMestre) {
      if (newVal.length > 2) newVal = newVal.slice(0, 2);
      onChange(newVal, idx);
      if ((newVal.length === 2 || parseInt(newVal, 10) > 9) && idx < 3) {
        inputRefs.current[idx + 1]?.focus();
      }
    } else {
      if (newVal.length > 1) newVal = newVal[0];
      onChange(newVal, idx);
      if (newVal && idx < 3) inputRefs.current[idx + 1]?.focus();
    }
  };

  const gapClass = modoVisual
    ? isCodigoMestre
      ? "gap-6"
      : "gap-4"
    : isCasual
      ? "gap-3 sm:gap-3.5"
      : isCodigoMestre
        ? "gap-3"
        : "gap-1";

  const arrowWidthClass = modoVisual
    ? isCodigoMestre
      ? "w-16 text-[38px]"
      : "w-14 text-[32px]"
    : "w-12 text-[22px]";

  const renderInput = (digit: string, i: number) => (
    <input
      key={i}
      value={digit}
      onChange={(e) => handleInputChange(e.target.value, i)}
      onFocus={() => setFocusedIndex(i)}
      maxLength={isCodigoMestre && modoVisual ? 2 : isCodigoMestre ? 2 : 1}
      ref={(el) => {
        inputRefs.current[i] = el;
      }}
      disabled={hasWon || isLost}
      inputMode="numeric"
      aria-label={`Dígito ${i + 1}`}
      className={cn(
        isCasual ? "game-digit-input-casual" : "game-digit-input",
        shakeInput && "shake-anim",
        isCasual &&
          focusedIndex === i &&
          !hasWon &&
          !isLost &&
          "game-digit-input-casual-active",
        modoVisual && "size-[72px] rounded-xl border-[3px] text-[2.5rem]",
        modoVisual && isCodigoMestre && "size-20 text-[2.75rem]"
      )}
      placeholder={isCodigoMestre ? "00" : isCasual ? "" : "_"}
    />
  );

  if (modoVisual) {
    return (
      <div className="flex flex-col items-center">
        <div className={cn("mb-1.5 flex min-h-8 justify-center", gapClass)}>
          {inputDigits.map((_, i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-8 text-center font-bold transition-colors select-none",
                arrowWidthClass,
                arrowColor(statuses[i], "up")
              )}
            >
              ↑
            </span>
          ))}
        </div>
        <div className={cn("my-2 flex justify-center", gapClass)}>
          {inputDigits.map((digit, i) => renderInput(digit, i))}
        </div>
        <div className={cn("flex min-h-8 justify-center", gapClass)}>
          {inputDigits.map((_, i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-8 text-center font-bold transition-colors select-none",
                arrowWidthClass,
                arrowColor(statuses[i], "down")
              )}
            >
              ↓
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex justify-center",
        isCasual ? "game-casual-input-wrap" : "my-1 shrink-0",
        gapClass
      )}
    >
      {inputDigits.map((digit, i) => renderInput(digit, i))}
    </div>
  );
};
