// src/components/Game.tsx
import React, { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { GuessRow } from "./GuessRow";
import { generateCode } from "../utils/generateCode";
import {
  Title,
  Subtitle,
  DigitInput,
  SubmitButton,
  RestartButton,
  WinnerMessage,
  Counter,
  PageWrapper,
  Content,
  Controls,
  InputArea,
  GuessTable,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Keypad,
  Key,
  ActionGroup,
} from "../styles/AppStyles";
import { getFeedback } from "../utils/getFeedback";
interface GameProps {
  mode: "easy" | "hard";
}
export const Game: React.FC<GameProps> = ({ mode }) => {
  const [codes, setCodes] = useState<{ easy: string[]; hard: string[] }>({
    easy: generateCode(),
    hard: generateCode(),
  });
  const [allGuesses, setAllGuesses] = useState<{
    easy: string[][];
    hard: string[][];
  }>({
    easy: [],
    hard: [],
  });
  const [hasWon, setHasWon] = useState<{ easy: boolean; hard: boolean }>({
    easy: false,
    hard: false,
  });
  const [inputDigits, setInputDigits] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const keypadKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "↵", "⌫"];

  const secretCode = codes[mode];
  const guesses = allGuesses[mode];
  const isWinner = hasWon[mode];

  // Foca o primeiro input ao montar e após reset
  const focusField = (idx = 0) => inputRefs.current[idx]?.focus();
  useEffect(() => {
    focusField();
  }, []);

  const handleChange = (val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val)) return;
    const d = [...inputDigits];
    d[idx] = val;
    setInputDigits(d);
    if (val && idx < 3) focusField(idx + 1);
  };

  const handleKey = (e: KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !inputDigits[idx] && idx > 0) {
      focusField(idx - 1);
    }
    if (e.key === "Enter" && inputDigits.every((c) => c)) {
      handleGuess();
    }
  };

  const handleGuess = () => {
    if (isWinner) return;
    if (inputDigits.some((c) => !c)) return;

    setAllGuesses((prev) => ({
      ...prev,
      [mode]: [...prev[mode], [...inputDigits]],
    }));

    if (inputDigits.join("") === secretCode.join("")) {
      setHasWon((prev) => ({ ...prev, [mode]: true }));
    }

    setInputDigits(["", "", "", ""]);
    focusField();
  };

  const handleRestart = () => {
    setCodes((prev) => ({ ...prev, [mode]: generateCode() }));
    setAllGuesses((prev) => ({ ...prev, [mode]: [] }));
    setHasWon((prev) => ({ ...prev, [mode]: false }));
    setInputDigits(["", "", "", ""]);
    focusField();
  };

  const handleClear = () => {
    setAllGuesses((prev) => ({ ...prev, [mode]: [] }));
    setInputDigits(["", "", "", ""]);
    setHasWon((prev) => ({ ...prev, [mode]: false }));
    focusField();
  };

  return (
    <>
      <PageWrapper>
        <Content>
          <Controls>
            <Title>Code Game</Title>
            <Counter>
              Tentativa {isWinner ? guesses.length : guesses.length + 1} de ∞
            </Counter>
          </Controls>

          {/* INPUTS + ENVIAR */}
          <InputArea>
            {inputDigits.map((digit, idx) => (
              <DigitInput
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKey(e, idx)}
                ref={(el) => {
                  if (el) inputRefs.current[idx] = el;
                }}
                aria-label={`Dígito ${idx + 1}`}
                disabled={isWinner}
                readOnly
              />
            ))}
            <SubmitButton
              onClick={handleGuess}
              disabled={inputDigits.some((c) => !c) || isWinner}
            >
              Enviar
            </SubmitButton>
          </InputArea>
          <Keypad>
            {keypadKeys.map((k, i) => (
              <Key
                key={i}
                onClick={() => {
                  if (typeof k === "number") {
                    // insere dígito
                    const idx = inputDigits.findIndex((d) => d === "");
                    if (idx !== -1) handleChange(String(k), idx);
                  } else if (k === "⌫") {
                    // exclui último dígito
                    const lastFilled = inputDigits
                      .map((d, i) => (d ? i : -1))
                      .filter((i) => i >= 0)
                      .pop();
                    if (lastFilled !== undefined) {
                      handleChange("", lastFilled);
                      focusField(lastFilled);
                    }
                  } else {
                    // enter
                    handleGuess();
                  }
                }}
              >
                {k}
              </Key>
            ))}
          </Keypad>

          <ActionGroup>
            <RestartButton onClick={handleClear}>Resetar Rodada</RestartButton>
            <RestartButton onClick={handleRestart}>Novo Jogo</RestartButton>
          </ActionGroup>

          {/* MENSAGEM DE VITÓRIA */}
          {isWinner && <WinnerMessage>Parabéns! cadeado aberto!</WinnerMessage>}

          {/* TENTATIVAS no modo EASY (cards coloridos) */}
          {mode === "easy" &&
            guesses.map((g, i) => (
              <GuessRow
                key={i}
                guess={g}
                code={secretCode}
                mode={mode}
                attempt={i + 1}
              />
            ))}

          {/* HISTÓRICO DE TENTATIVAS no modo HARD (tabela) */}
          {mode === "hard" && guesses.length > 0 && (
            <>
              <Subtitle>Histórico de tentativas</Subtitle>
              <GuessTable>
                <TableHead>
                  <tr>
                    <TableHeader>#</TableHeader>
                    <TableHeader>Palpite</TableHeader>
                    <TableHeader>Certos</TableHeader>
                    <TableHeader>Presentes</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {guesses.map((guessArr, idx) => {
                    const { correctPlace, correctDigit } = getFeedback(
                      guessArr,
                      secretCode
                    );
                    return (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{guessArr.join(" ")}</TableCell>
                        <TableCell>
                          <Badge variant="success">{correctPlace}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning">{correctDigit}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </GuessTable>
            </>
          )}
        </Content>
      </PageWrapper>
    </>
  );
};
