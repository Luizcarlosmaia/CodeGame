import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  DigitInput,
  SubmitButton,
  RestartButton,
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
  ActiveIconButton,
} from "../styles/AppStyles";
import { BarChartIcon } from "lucide-react";
import { StatsModal } from "./StatsModal";
import { getFeedback } from "../utils/getFeedback";
import {
  loadGameState,
  saveGameState,
  type SavedMode,
} from "../utils/gameState";

interface GameProps {
  mode: Mode;
  onWin: (stats: Stats) => void;
  __testCode?: string[];
  code?: string[];
  guesses?: string[][];
  hasWon?: boolean;
  inputDigits?: string[];
  setInputDigits?: (digits: string[]) => void;
  onGuess?: (guess: string[]) => void;
  onInputChange?: (val: string, idx: number) => void;
  onClear?: () => void;
  maxTriesOverride?: number;
  onBack?: () => void; // Optional custom back handler
}

export const Game: React.FC<GameProps & { backTo?: string }> = ({
  mode,
  onWin,
  __testCode,
  code: codeProp,
  guesses: guessesProp,
  hasWon: hasWonProp,
  inputDigits: inputDigitsProp,
  setInputDigits: setInputDigitsProp,
  onGuess,
  onInputChange,
  onClear,
  maxTriesOverride,
  backTo,
  onBack,
}) => {
  const [shakeInput, setShakeInput] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const navigate = useNavigate();
  const today = todayKey();

  const dailyCasual = generateDailyCode(`${today}-casual`);
  const dailyDesafio = generateDailyCode(`${today}-desafio`);

  // Estado local só para modos não-controlados (casual/desafio)
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

  const [animateRow, setAnimateRow] = useState<null | {
    idx: number;
    type: "win" | "lose";
  }>(null);
  const [entryRow, setEntryRow] = useState<null | number>(null);
  const [, setShowModal] = useState(() => {
    const guesses = gameState[mode]?.guesses || [];
    const hasWon = gameState[mode]?.hasWon;
    const maxTries = mode === "casual" ? 6 : mode === "desafio" ? 15 : Infinity;
    return (
      guesses.length > 0 && (hasWon || (!hasWon && guesses.length >= maxTries))
    );
  });

  // Só salva no localStorage se não for modo controlado
  useEffect(() => {
    if (mode === "custom" && (codeProp || guessesProp || hasWonProp)) return;
    saveGameState(mode, gameState[mode]);
  }, [mode, gameState, codeProp, guessesProp, hasWonProp]);

  // Input controlado ou não
  const [inputDigitsState, setInputDigitsState] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const inputDigits = inputDigitsProp ?? inputDigitsState;
  const setInputDigits = setInputDigitsProp ?? setInputDigitsState;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const focusField = (i = 0) => inputRefs.current[i]?.focus();
  useEffect(focusField, []);

  // Estado do jogo: controlado ou não
  const secretCode = codeProp ?? gameState[mode]!.code;
  const guesses = guessesProp ?? gameState[mode]!.guesses;
  const hasWon = hasWonProp ?? gameState[mode]!.hasWon;

  const maxTries =
    maxTriesOverride ??
    (mode === "casual" ? 6 : mode === "desafio" ? 15 : Infinity);
  const isLost = !hasWon && guesses.length >= maxTries;

  const handleChange = (val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val) || hasWon || isLost) return;
    if (onInputChange) {
      onInputChange(val, idx);
      return;
    }
    const next = [...inputDigits];
    next[idx] = val;
    setInputDigits(next);
    if (val && idx < 3) focusField(idx + 1);
  };

  const handleGuess = () => {
    if (hasWon || isLost) return;
    if (inputDigits.some((d) => !d)) {
      setShakeInput(false);
      setTimeout(() => setShakeInput(true), 10);
      setTimeout(() => setShakeInput(false), 350);
      return;
    }
    if (guesses.length >= maxTries) return;

    if (onGuess) {
      onGuess([...inputDigits]);
      setInputDigits(["", "", "", ""]);
      focusField();
      return;
    }

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

    const ENTRY_ANIMATION = 500;
    const ROW_ANIMATION = 500;
    const MODAL_DELAY = 400;

    setEntryRow(guesses.length);
    setTimeout(() => {
      setEntryRow(null);
      if (isCorrect) {
        setAnimateRow({ idx: guesses.length, type: "win" });
        setTimeout(() => {
          setAnimateRow(null);
          setTimeout(() => {
            setShowModal(true);
          }, MODAL_DELAY);
          const old = loadStats(mode);
          const used = guesses.length + 1;
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
        }, ROW_ANIMATION);
      } else if (nextGuesses.length === maxTries) {
        setAnimateRow({ idx: guesses.length, type: "lose" });
        setTimeout(() => {
          setAnimateRow(null);
          setTimeout(() => {
            setShowModal(true);
          }, MODAL_DELAY);
          const old = loadStats(mode);
          const s: Stats = {
            ...old,
            totalGames: old.totalGames + 1,
            currentStreak: 0,
            bestStreak: old.bestStreak,
            distribution: { ...old.distribution },
          };
          saveStats(mode, s);
          onWin(s);
        }, ROW_ANIMATION);
      }
    }, ENTRY_ANIMATION);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
      setInputDigits(["", "", "", ""]);
      focusField();
      return;
    }
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

  // const keypad = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "⌫"] as const;

  // --- Mensagem de vitória/derrota (mesma lógica do StatsModal) ---
  let result: "win" | "lose" | null = null;
  let playedToday = false;
  if (mode === "casual" || mode === "desafio") {
    const stats = loadStats(mode);
    const todayStr = todayKey();
    // Jogou hoje se stats.date === hoje e stats.totalGames > 0 e terminou o jogo
    playedToday =
      stats.date === todayStr && stats.totalGames > 0 && (hasWon || isLost);
    if (playedToday) {
      if (hasWon) {
        result = "win";
      } else if (isLost) {
        result = "lose";
      }
    }
  }

  return (
    <PageWrapper>
      <Content>
        <Controls>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <ActiveIconButton
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigate(backTo ?? "/desafios");
                }
              }}
              aria-label="Voltar"
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.7rem",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Voltar"
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "inherit",
                }}
              >
                ⟵
              </span>
            </ActiveIconButton>
            <ActiveIconButton
              onClick={() => setShowStats(true)}
              aria-label="Ver estatísticas"
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.7rem",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Estatísticas"
            >
              <BarChartIcon />
            </ActiveIconButton>
          </div>
          <Counter>
            Tentativa {hasWon || isLost ? guesses.length : guesses.length + 1}{" "}
            de {mode === "casual" ? 6 : mode === "desafio" ? 15 : "∞"}
          </Counter>
        </Controls>

        {/* Mensagem de vitória/derrota entre teclado e input, igual StatsModal */}
        {playedToday && result === "win" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: "0.35em 0.7em 0.35em 0.5em",
              background: "#e6f7ec",
              color: "#217a4b",
              borderRadius: 8,
              fontSize: "1em",
              fontWeight: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              minHeight: 0,
              maxWidth: 350,
              marginLeft: "auto",
              marginRight: "auto",
              transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <span style={{ fontSize: "1.5em", marginRight: 6, lineHeight: 1 }}>
              🎉
            </span>
            <span style={{ fontSize: "0.8rem" }}>Você acertou o código!</span>
          </div>
        )}
        {playedToday && result === "lose" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              padding: "0.35em 0.7em 0.35em 0.5em",
              background: "#fbeaea",
              color: "#a13a3a",
              borderRadius: 8,
              fontSize: "1em",
              fontWeight: 600,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              minHeight: 0,
              maxWidth: 320,
              marginLeft: "auto",
              marginRight: "auto",
              transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <span style={{ fontSize: "1.5em", marginRight: 6, lineHeight: 1 }}>
              😞
            </span>
            <span>Não foi dessa vez!</span>
          </div>
        )}

        <InputArea as="div" shake={shakeInput}>
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
        </InputArea>
        {mode === "custom" && (
          <ActionGroup>
            <RestartButton onClick={handleClear}>Resetar Rodada</RestartButton>
            <RestartButton onClick={handleRestart}>Novo Jogo</RestartButton>
          </ActionGroup>
        )}

        {mode === "casual" &&
          Array.from({ length: 6 }).map((_, i) => {
            const g = guesses[i] ?? ["", "", "", ""];
            const animateEntry = entryRow === i && g.some((d) => d !== "");
            return (
              <GuessRow
                key={i}
                guess={g}
                code={secretCode}
                mode={mode}
                attempt={i + 1}
                animate={animateRow?.idx === i}
                animationType={animateRow?.type}
                animateEntry={animateEntry}
                staggerEntry={true}
              />
            );
          })}
        {mode === "desafio" && (
          <>
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
                {Array.from({ length: 15 }).map((_, i) => {
                  const g = guesses[i] ?? ["", "", "", ""];
                  const isFilled = i < guesses.length;
                  const { correctPlace, correctDigit } = isFilled
                    ? getFeedback(g, secretCode)
                    : { correctPlace: "-", correctDigit: "-" };
                  return (
                    <TableRow
                      key={i}
                      $animateEntry={isFilled}
                      style={{
                        background: isFilled ? undefined : "#f5f5f5",
                        color: isFilled ? undefined : "#bbb",
                        opacity: isFilled ? 1 : 0.7,
                      }}
                    >
                      <TableCell>{i + 1}</TableCell>
                      <TableCell $palpite>{g.join(" ")}</TableCell>
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
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <Keypad>
            {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((k) => (
              <Key
                key={k}
                disabled={hasWon || isLost}
                onClick={() => {
                  if (hasWon || isLost) return;
                  const idx = inputDigits.indexOf("");
                  if (idx >= 0) handleChange(String(k), idx);
                }}
              >
                {k}
              </Key>
            ))}
            <Key
              disabled={hasWon || isLost}
              onClick={() => {
                if (hasWon || isLost) return;
                const last = inputDigits
                  .map((d, j) => (d ? j : -1))
                  .filter((j) => j >= 0)
                  .pop();
                if (last != null) handleChange("", last);
              }}
            >
              ⌫
            </Key>
          </Keypad>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <SubmitButton
            onClick={handleGuess}
            disabled={hasWon || isLost || guesses.length >= maxTries}
          >
            Enviar
          </SubmitButton>
        </div>
        {/* Modal de estatísticas */}
        {showStats && (
          <StatsModal
            stats={loadStats(mode)}
            maxTries={
              mode === "casual" ? 6 : mode === "desafio" ? 15 : Infinity
            }
            onClose={() => setShowStats(false)}
            playedToday={(() => {
              const stats = loadStats(mode);
              return Array.isArray(stats?.distribution)
                ? Object.values(stats?.distribution || {}).some((v) => v > 0)
                : (stats?.totalGames ?? 0) > 0;
            })()}
          />
        )}
      </Content>
    </PageWrapper>
  );
};
