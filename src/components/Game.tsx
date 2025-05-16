// src/components/Game.tsx
import React, { useState, useRef, useEffect } from "react";
import { GuessRow } from "./GuessRow";
import { generateCode } from "../utils/generateCode";
import {
  loadStats,
  saveStats,
  type Stats,
  type Mode,
  todayKey,
} from "../utils/stats";
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
import {
  loadGameState,
  saveGameState,
  type SavedMode,
} from "../utils/gameState";
import { generateDailyCode } from "../utils/generateDailyCode";

interface GameProps {
  mode: Mode;
  onWin: (stats: Stats) => void;
}

export const Game: React.FC<GameProps> = ({ mode, onWin }) => {
  const savedState: SavedMode = loadGameState(mode);
  const {
    code: savedCode,
    guesses: savedGuesses,
    hasWon: savedWon,
  } = savedState;

  // 2) Guarda a data atual pra reset diário
  const todayRef = useRef<string>(todayKey());

  const [secretCodes, setSecretCodes] = useState<Record<Mode, string[]>>({
    easy:
      Array.isArray(savedCode) && savedCode.length === 4
        ? savedCode
        : generateCode(),
    hard:
      Array.isArray(savedCode) && savedCode.length === 4
        ? savedCode
        : generateCode(),
    practice:
      Array.isArray(savedCode) && savedCode.length === 4
        ? savedCode
        : generateCode(),
  });

  // 4) Histórico de guesses e flag de vitória do storage
  const [guesses, setGuesses] = useState<string[][]>(() => savedGuesses || []);
  const [hasWon, setHasWon] = useState<boolean>(() => savedWon || false);

  useEffect(() => {
    const seed = todayKey(); // "20250517"
    const dailyCode = generateDailyCode(seed);

    setSecretCodes({
      easy: dailyCode, // todo mundo,
      hard: dailyCode, // em ambos os modos diários,
      practice: generateCode(), // mas practice continua livre
    });
    setGuesses([]); // opcional: zera histórico
    setHasWon(false);
  }, [todayKey()]);

  // 6) Inputs + foco
  const [inputDigits, setInputDigits] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const focusField = (i = 0) => inputRefs.current[i]?.focus();
  useEffect(focusField, []);

  // 7) Limites por modo
  const maxTries = mode === "easy" ? 6 : mode === "hard" ? 15 : Infinity;
  const secretCode = secretCodes[mode];
  const keypad = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "⌫"] as const;

  // 8) Persistência: sempre que mudar guesses/hasWon, salva o estado completo
  useEffect(() => {
    saveGameState(mode, {
      code: secretCode,
      guesses,
      hasWon,
      date: todayRef.current,
    });
  }, [mode, secretCode, guesses, hasWon]);

  // handleChange de cada dígito
  const handleChange = (val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...inputDigits];
    next[idx] = val;
    setInputDigits(next);
    if (val && idx < 3) focusField(idx + 1);
  };

  // onClick do botão Enviar
  const handleGuess = () => {
    if (hasWon) return;
    if (inputDigits.some((d) => !d)) return;
    if (guesses.length >= maxTries) return;

    const isCorrect = inputDigits.join("") === secretCode.join("");
    const nextGuesses = [...guesses, [...inputDigits]];

    setGuesses(nextGuesses);
    setInputDigits(["", "", "", ""]);
    focusField();

    if (isCorrect) {
      setHasWon(true);

      // atualiza stats
      const old = loadStats(mode);
      const used = nextGuesses.length;
      const s: Stats = {
        date: old.date,
        totalGames: old.totalGames + 1,
        totalWins: old.totalWins + 1,
        currentStreak: old.currentStreak + 1,
        bestStreak: Math.max(old.bestStreak, old.currentStreak + 1),
        distribution: { ...old.distribution },
      };
      s.distribution[used] = (s.distribution[used] || 0) + 1;
      saveStats(mode, s);

      // dispara modal no App
      onWin(s);
    }
  };

  // Limpa histórico & vitória (só practice)
  const handleClear = () => {
    setGuesses([]);
    setHasWon(false);
    setInputDigits(["", "", "", ""]);
    focusField();
  };
  const handleRestart = () => {
    setSecretCodes((p) => ({ ...p, practice: generateCode() }));
    handleClear();
  };

  return (
    <PageWrapper>
      <Content>
        <Controls>
          <Title>Code Game</Title>
          <Counter>
            Tentativa {hasWon ? guesses.length : guesses.length + 1} de 6
          </Counter>
        </Controls>

        <InputArea>
          {inputDigits.map((digit, i) => (
            <DigitInput
              key={i}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              maxLength={1}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              disabled={hasWon}
            />
          ))}
          <SubmitButton
            onClick={handleGuess}
            disabled={hasWon || inputDigits.some((d) => !d)}
          >
            Enviar
          </SubmitButton>
        </InputArea>

        <Keypad>
          {keypad.map((k, i) => (
            <Key
              key={i}
              disabled={hasWon}
              onClick={() => {
                if (hasWon) return;
                if (k === "⌫") {
                  const last = inputDigits
                    .map((d, j) => (d ? j : -1))
                    .filter((j) => j >= 0)
                    .pop();
                  if (last != null) handleChange("", last);
                } else {
                  const idx = inputDigits.indexOf("");
                  if (idx >= 0) handleChange(String(k), idx);
                }
              }}
            >
              {k}
            </Key>
          ))}
        </Keypad>

        {mode === "practice" && (
          <ActionGroup>
            <RestartButton onClick={handleClear}>Resetar Rodada</RestartButton>
            <RestartButton onClick={handleRestart}>Novo Jogo</RestartButton>
          </ActionGroup>
        )}

        {hasWon && <WinnerMessage>Parabéns! cadeado aberto!</WinnerMessage>}

        {mode === "easy" &&
          // sempre 6 tentativas
          Array.from({ length: 6 }).map((_, i) => {
            const g = guesses[i];
            return g ? (
              <GuessRow
                key={i}
                guess={g}
                code={secretCode}
                mode={mode}
                attempt={i + 1}
              />
            ) : (
              // placeholder vazio
              <GuessRow
                key={i}
                guess={["", "", "", ""]}
                code={secretCode}
                mode={mode}
                attempt={i + 1}
              />
            );
          })}

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
                {guesses.map((g, i) => {
                  const { correctPlace, correctDigit } = getFeedback(
                    g,
                    secretCode
                  );
                  return (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{g.join(" ")}</TableCell>
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
