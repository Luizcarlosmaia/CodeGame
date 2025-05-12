// src/components/Game.tsx
import React, { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { GuessRow } from "./GuessRow";
import { generateCode } from "../utils/generateCode";
import type { GameMode } from "../types";
import {
  Title,
  Subtitle,
  ModeToggleGroup,
  ModeToggleButton,
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
} from "../styles/AppStyles";
import { getFeedback } from "../utils/getFeedback";

export const Game: React.FC = () => {
  const [secretCode, setSecretCode] = useState<string[]>(generateCode);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [inputDigits, setInputDigits] = useState(["", "", "", ""]);
  const [mode, setMode] = useState<GameMode>("easy");
  const [isWinner, setIsWinner] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setGuesses((g) => [...g, [...inputDigits]]);
    if (inputDigits.join("") === secretCode.join("")) setIsWinner(true);
    setInputDigits(["", "", "", ""]);
    focusField();
  };

  const handleRestart = () => {
    setSecretCode(generateCode());
    setGuesses([]);
    setIsWinner(false);
    setInputDigits(["", "", "", ""]);
    focusField();
  };

  const handleClear = () => {
    setGuesses([]); // limpa o histórico
    setInputDigits(["", "", "", ""]); // zera inputs
    setIsWinner(false); // reseta vitória
    focusField(); // foca no primeiro campo
  };

  return (
    <PageWrapper>
      <Content>
        {/* CONTROLS */}
        <Controls>
          <Title>Jogo do Cadeado</Title>
          <Counter>
            Tentativa {isWinner ? guesses.length : guesses.length + 1} de ∞
          </Counter>
          <Subtitle>
            Modo:
            <ModeToggleGroup>
              <ModeToggleButton
                active={mode === "easy"}
                onClick={() => setMode("easy")}
              >
                Fácil
              </ModeToggleButton>
              <ModeToggleButton
                active={mode === "hard"}
                onClick={() => setMode("hard")}
              >
                Difícil
              </ModeToggleButton>
            </ModeToggleGroup>
          </Subtitle>
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
            />
          ))}
          <SubmitButton
            onClick={handleGuess}
            disabled={inputDigits.some((c) => !c) || isWinner}
          >
            Enviar
          </SubmitButton>
        </InputArea>

        <RestartButton onClick={handleClear}>Limpar Tentativas</RestartButton>
        <RestartButton onClick={handleRestart}>Novo Desafio</RestartButton>

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
  );
};
