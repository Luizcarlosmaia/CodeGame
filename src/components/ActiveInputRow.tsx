import React from "react";
import { DigitInput } from "../styles/AppStyles";
import { getStatuses } from "../utils/getFeedback";
import {
  RowWrapper,
  ArrowRow,
  Arrow,
  InputsRow,
} from "./ActiveInputRow.styles";

interface ActiveInputRowProps {
  inputDigits: string[];
  secretCode: string[];
  isCodigoMestre: boolean;
  onChange: (val: string, idx: number) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  hasWon: boolean;
  isLost: boolean;
  guessesLength?: number;
  modoVisual?: boolean; // novo: ativa layout especial
  shakeInput?: boolean; // animação de erro
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
}) => {
  // Só mostra feedback visual se já enviou (todos preenchidos e já tentou)
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

  // Função para controlar avanço automático do input
  const handleInputChange = (val: string, idx: number) => {
    let newVal = val.replace(/\D/g, "");
    if (isCodigoMestre) {
      if (newVal.length > 2) newVal = newVal.slice(0, 2);
      onChange(newVal, idx);
      // Só avança se tiver 2 dígitos OU se o valor for maior que 9
      if ((newVal.length === 2 || parseInt(newVal, 10) > 9) && idx < 3) {
        inputRefs.current[idx + 1]?.focus();
      }
    } else {
      if (newVal.length > 1) newVal = newVal[0];
      onChange(newVal, idx);
      if (newVal && idx < 3) inputRefs.current[idx + 1]?.focus();
    }
  };

  // Layout especial só se modoVisual=true (codigo-mestre)
  if (modoVisual) {
    return (
      <RowWrapper>
        <ArrowRow $isCodigoMestre={isCodigoMestre} $modoVisual={modoVisual}>
          {inputDigits.map((_, i) => (
            <Arrow
              key={i}
              $status={statuses[i]}
              $arrow="up"
              $isCodigoMestre={isCodigoMestre}
              $modoVisual={modoVisual}
            >
              ↑
            </Arrow>
          ))}
        </ArrowRow>
        <InputsRow $isCodigoMestre={isCodigoMestre} $modoVisual={modoVisual}>
          {inputDigits.map((digit, i) => (
            <DigitInput
              key={i}
              value={digit}
              onChange={(e) => handleInputChange(e.target.value, i)}
              maxLength={isCodigoMestre && modoVisual ? 2 : 1}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              disabled={hasWon || isLost}
              inputMode="numeric"
              className={shakeInput ? "shake" : ""}
              // Tamanhos grandes só no modo codigo-mestre visual
              style={
                isCodigoMestre && modoVisual
                  ? {
                      width: 80,
                      height: 80,
                      fontSize: 44,
                      borderWidth: 3,
                      borderRadius: 12,
                    }
                  : modoVisual
                  ? {
                      width: 72,
                      height: 72,
                      fontSize: 40,
                      borderWidth: 3,
                      borderRadius: 12,
                    }
                  : undefined
              }
              placeholder={isCodigoMestre ? "00" : "_"}
            />
          ))}
        </InputsRow>
        <ArrowRow $isCodigoMestre={isCodigoMestre} $modoVisual={modoVisual}>
          {inputDigits.map((_, i) => (
            <Arrow
              key={i}
              $status={statuses[i]}
              $arrow="down"
              $isCodigoMestre={isCodigoMestre}
              $modoVisual={modoVisual}
            >
              ↓
            </Arrow>
          ))}
        </ArrowRow>
      </RowWrapper>
    );
  }

  // Layout padrão para outros modos
  return (
    <InputsRow $isCodigoMestre={isCodigoMestre} $modoVisual={false}>
      {inputDigits.map((digit, i) => (
        <DigitInput
          key={i}
          value={digit}
          onChange={(e) => handleInputChange(e.target.value, i)}
          maxLength={isCodigoMestre ? 2 : 1}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          disabled={hasWon || isLost}
          inputMode="numeric"
          className={shakeInput ? "shake" : ""}
          placeholder={isCodigoMestre ? "00" : "_"}
        />
      ))}
    </InputsRow>
  );
};
