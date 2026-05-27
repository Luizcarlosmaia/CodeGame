import React from "react";
import { getStatuses } from "../utils/getFeedback";
import {
  CodigoMestreRowWrapper,
  CodigoMestreArrowRow,
  CodigoMestreArrow,
  CodigoMestreInputsRow,
  CodigoMestreDigitInput,
} from "./CodigoMestreInputRow.styles";

interface Props {
  inputDigits: string[];
  secretCode: string[];
  onChange: (val: string, idx: number) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  hasWon: boolean;
  isLost: boolean;
  guessesLength: number;
  shakeInput?: boolean;
}

export const CodigoMestreInputRow: React.FC<Props> = ({
  inputDigits,
  secretCode,
  onChange,
  inputRefs,
  hasWon,
  isLost,
  guessesLength,
  shakeInput = false,
}) => {
  // Sempre força 2 dígitos (zero à esquerda) em cada campo
  const normalizedInputDigits = inputDigits.map((d) => d.padStart(2, "0"));
  const normalizedSecretCode = secretCode.map((d) => d.padStart(2, "0"));

  // Só mostra feedback se todos os campos tiverem 2 dígitos
  const showFeedback =
    (normalizedInputDigits.every((d) => d.length === 2) && guessesLength > 0) ||
    hasWon ||
    isLost;
  const statuses =
    showFeedback &&
    Array.isArray(normalizedInputDigits) &&
    Array.isArray(normalizedSecretCode) &&
    normalizedInputDigits.length === 4 &&
    normalizedSecretCode.length === 4
      ? getStatuses(normalizedInputDigits, normalizedSecretCode)
      : Array(4).fill("absent");

  // Corrige avanço: só avança se o valor ANTES da digitação tinha 1 dígito e AGORA tem 2 (ou seja, usuário digitou o segundo dígito)
  const handleInputChange = (val: string, idx: number) => {
    let newVal = val.replace(/\D/g, "");
    if (newVal.length > 2) newVal = newVal.slice(0, 2);
    const prev = inputDigits[idx] || "";
    onChange(newVal, idx);
    if (prev.length === 1 && newVal.length === 2 && idx < 3) {
      setTimeout(() => {
        inputRefs.current[idx + 1]?.focus();
      }, 0);
    }
  };

  return (
    <CodigoMestreRowWrapper>
      <CodigoMestreArrowRow>
        {inputDigits.map((_, i) => (
          <CodigoMestreArrow key={i} $status={statuses[i]} $arrow="up">
            ↑
          </CodigoMestreArrow>
        ))}
      </CodigoMestreArrowRow>
      <CodigoMestreInputsRow>
        {inputDigits.map((digit, i) => (
          <CodigoMestreDigitInput
            key={i}
            value={digit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(e.target.value, i)
            }
            maxLength={2}
            ref={(el: HTMLInputElement | null) => {
              inputRefs.current[i] = el;
            }}
            disabled={hasWon || isLost}
            inputMode="numeric"
            className={shakeInput ? "shake" : ""}
            placeholder="00"
            onFocus={() => {
              (
                window as unknown as { codigoMestreFocus: number }
              ).codigoMestreFocus = i;
            }}
            onBlur={() => {
              // Se só tem 1 dígito, completa com zero à esquerda
              if (digit.length === 1) {
                onChange(digit.padStart(2, "0"), i);
              }
            }}
          />
        ))}
      </CodigoMestreInputsRow>
      <CodigoMestreArrowRow>
        {inputDigits.map((_, i) => (
          <CodigoMestreArrow key={i} $status={statuses[i]} $arrow="down">
            ↓
          </CodigoMestreArrow>
        ))}
      </CodigoMestreArrowRow>
    </CodigoMestreRowWrapper>
  );
};
