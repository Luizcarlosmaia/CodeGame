// src/components/Game.tsx
import React, { useState, useRef, useEffect } from "react";
import { GuessRow } from "./GuessRow";
import { generateCode } from "../utils/generateCode";
import { generateDailyCode } from "../utils/generateDailyCode";
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

interface GameProps {
  mode: Mode;
  onWin: (stats: Stats) => void;
  /** Somente para testes automatizados: força o código secreto */
  __testCode?: string[];
}

export const Game: React.FC<GameProps> = ({ mode, onWin, __testCode }) => {
  const today = todayKey();

  // geramos duas seeds diárias distintas
  const dailyCasual = generateDailyCode(`${today}-casual`);
  const dailyDesafio = generateDailyCode(`${today}-desafio`);

  // 1) inicializa estado carregando do localStorage (ou cria fallback)
  const [gameState, setGameState] = useState<Record<Mode, SavedMode>>(() => {
    const fallback: Record<Mode, SavedMode> = {
      casual: {
        code: __testCode || dailyCasual,
        guesses: [],
        hasWon: false,
        date: today,
      },
      desafio: {
        code: __testCode || dailyDesafio,
        guesses: [],
        hasWon: false,
        date: today,
      },
      custom: {
        code: __testCode || generateCode(),
        guesses: [],
        hasWon: false,
        date: today,
      },
    };
    return (["casual", "desafio", "custom"] as Mode[]).reduce((acc, m) => {
      const saved = loadGameState(m);
      const isToday = saved.date === today;
      acc[m] = {
        code:
          Array.isArray(saved.code) && saved.code.length === 4 && isToday
            ? saved.code
            : fallback[m].code,
        guesses: isToday ? saved.guesses : [],
        hasWon: isToday ? saved.hasWon : false,
        date: today,
      };
      return acc;
    }, {} as Record<Mode, SavedMode>);
  });

  // 2) salva no storage sempre que mudar o modo ativo ou seu estado
  useEffect(() => {
    saveGameState(mode, gameState[mode]);
  }, [mode, gameState]);

  // 3) controle de inputs
  const [inputDigits, setInputDigits] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const focusField = (i = 0) => inputRefs.current[i]?.focus();
  useEffect(focusField, []);

  // 4) extrai do estado atual
  const { code: secretCode, guesses, hasWon } = gameState[mode]!;

  // 5) limites e flags
  const maxTries = mode === "casual" ? 6 : mode === "desafio" ? 15 : Infinity;
  const isLost = !hasWon && guesses.length >= maxTries;

  const handleChange = (val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val) || hasWon || isLost) return;
    const next = [...inputDigits];
    next[idx] = val;
    setInputDigits(next);
    if (val && idx < 3) focusField(idx + 1);
  };

  const handleGuess = () => {
    if (hasWon || isLost) return;
    if (inputDigits.some((d) => !d)) return;
    if (guesses.length >= maxTries) return;

    const isCorrect = inputDigits.join("") === secretCode.join("");
    const nextGuesses = [...guesses, [...inputDigits]];

    setGameState((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode]!,
        guesses: nextGuesses,
        hasWon: prev[mode]!.hasWon || isCorrect,
        date: today,
      },
    }));

    setInputDigits(["", "", "", ""]);
    focusField();

    if (isCorrect) {
      // ——————— Vitória ———————
      const old = loadStats(mode);
      // Conta apenas tentativas reais até a vitória
      const used = guesses.length + 1; // guesses ainda não inclui o palpite correto
      const s: Stats = {
        ...old,
        totalGames: old.totalGames + 1,
        totalWins: old.totalWins + 1,
        currentStreak: old.currentStreak + 1,
        bestStreak: Math.max(old.bestStreak, old.currentStreak + 1),
        distribution: { ...old.distribution },
      };
      s.distribution[used] = (s.distribution[used] || 0) + 1;
      saveStats(mode, s);
      onWin(s);
    } else if (nextGuesses.length === maxTries) {
      // ——————— Derrota no último palpite ———————
      const old = loadStats(mode);
      const s: Stats = {
        ...old,
        totalGames: old.totalGames + 1,
        // totalWins não aumenta
        currentStreak: 0,
        bestStreak: old.bestStreak,
        distribution: { ...old.distribution },
      };
      // opcional: contabilizar derrotas em distribution[0]:
      // s.distribution[0] = (s.distribution[0] || 0) + 1;
      saveStats(mode, s);
      // para disparar o modal de estatísticas (mesmo na derrota)
      onWin(s);
    }
  };

  const handleClear = () => {
    setGameState((prev) => ({
      ...prev,
      custom: {
        ...prev.custom!,
        guesses: [],
        hasWon: false,
        date: today,
      },
    }));
    setInputDigits(["", "", "", ""]);
    focusField();
  };
  const handleRestart = () => {
    setGameState((prev) => ({
      ...prev,
      custom: {
        ...prev.custom!,
        code: generateCode(),
        date: today,
      },
    }));
    handleClear();
  };

  const keypad = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "⌫"] as const;

  // 8) render
  return (
    <PageWrapper>
      <Content>
        <Controls>
          <Title>Code Game</Title>
          <Counter>
            Tentativa {hasWon ? guesses.length : guesses.length + 1} de{" "}
            {mode === "casual" ? 6 : mode === "desafio" ? 15 : "∞"}
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
              disabled={hasWon || isLost}
              readOnly
              inputMode="none"
            />
          ))}
          <SubmitButton
            onClick={handleGuess}
            disabled={
              hasWon ||
              isLost ||
              inputDigits.some((d) => !d) ||
              guesses.length >= maxTries
            }
          >
            Enviar
          </SubmitButton>
        </InputArea>

        <Keypad>
          {keypad.map((k, i) => (
            <Key
              key={i}
              disabled={hasWon || isLost}
              onClick={() => {
                if (hasWon || isLost) return;
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

        {mode === "custom" && (
          <ActionGroup>
            <RestartButton onClick={handleClear}>Resetar Rodada</RestartButton>
            <RestartButton onClick={handleRestart}>Novo Jogo</RestartButton>
          </ActionGroup>
        )}

        {hasWon && <WinnerMessage>🎉 Parabéns! cadeado aberto!</WinnerMessage>}

        {isLost && !hasWon && (
          <WinnerMessage
            as="div"
            style={{ background: "#f8d7da", color: "#721c24" }}
          >
            😞 Você perdeu. O código era {secretCode.join("")}.
          </WinnerMessage>
        )}
        {/* EASY: placeholders fixos */}
        {mode === "casual" &&
          Array.from({ length: 6 }).map((_, i) => {
            const g = guesses[i] ?? ["", "", "", ""];
            return (
              <GuessRow
                key={i}
                guess={g}
                code={secretCode}
                mode={mode}
                attempt={i + 1}
              />
            );
          })}

        {/* HARD: histórico padrão */}
        {mode === "desafio" && guesses.length > 0 && (
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
