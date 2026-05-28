import React from "react";
import { cn } from "../lib/cn";

interface Props {
  inputDigits: string[];
  onChange: (val: string, idx: number) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  hasWon: boolean;
  isLost: boolean;
  shakeInput?: boolean;
}

export const CodigoMestreInputRow: React.FC<Props> = ({
  inputDigits,
  onChange,
  inputRefs,
  hasWon,
  isLost,
  shakeInput = false,
}) => {
  const handleInputChange = (val: string, idx: number) => {
    let newVal = val.replace(/\D/g, "");
    if (newVal.length > 2) newVal = newVal.slice(0, 2);
    onChange(newVal, idx);
  };

  return (
    <div className="game-codigo-mestre-input-wrap">
      <div className="game-codigo-mestre-fields">
        {inputDigits.map((digit, i) => (
          <input
            key={i}
            value={digit}
            onChange={(e) => handleInputChange(e.target.value, i)}
            maxLength={2}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            disabled={hasWon || isLost}
            inputMode="numeric"
            aria-label={`Posição ${i + 1}, valor de 0 a 99`}
            className={cn(
              "game-codigo-mestre-input",
              shakeInput && "shake-anim"
            )}
            placeholder="00"
            onFocus={() => {
              (
                window as unknown as { codigoMestreFocus: number }
              ).codigoMestreFocus = i;
            }}
            onBlur={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length === 1) {
                onChange(val.padStart(2, "0"), i);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};
