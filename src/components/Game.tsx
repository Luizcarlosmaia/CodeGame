import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  buildDailyGameStateRecord,
  isDailyGameMode,
  resetAllDailyGameStatesIfNewDay,
  resolveDailyGameState,
} from "../utils/dailyReset";
import { useTodayKey } from "../hooks/useTodayKey";
import { BarChartIcon } from "lucide-react";
import { getFeedback } from "../utils/getFeedback";
import { cn } from "../lib/cn";
import { ActiveInputRow } from "./ActiveInputRow";
import { CodigoMestreInputRow } from "./CodigoMestreInputRow";
import {
  CodigoMestreFeedback,
} from "./CodigoMestreFeedback";
import {
  loadGameState,
  saveGameState,
  type SavedMode,
} from "../utils/gameState";
import { getModeDisplay, getModeMaxTries, isDailyMode } from "../utils/modeLabels";

function buildInitialGameState(
  day: string,
  testCode?: string[]
): Record<Mode, SavedMode> {
  const daily = buildDailyGameStateRecord(day);

  return {
    casual: testCode ? { ...daily.casual, code: testCode } : daily.casual,
    desafio: testCode ? { ...daily.desafio, code: testCode } : daily.desafio,
    "codigo-mestre": testCode
      ? { ...daily["codigo-mestre"], code: testCode }
      : daily["codigo-mestre"],
    custom: {
      code: testCode || generateCode(),
      guesses: [],
      hasWon: false,
      date: day,
    },
  };
}

interface GameProps {
  mode: Mode;
  onWin: (stats: Stats, result?: "win" | "lose") => void;
  onOpenStats?: () => void;
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
  onOpenStats,
  __testCode,
  code: codeProp,
  guesses: guessesProp,
  hasWon: hasWonProp,
  inputDigits: inputDigitsProp,
  setInputDigits: setInputDigitsProp,
  onGuess,
  onInputChange,
  maxTriesOverride,
  backTo,
  onBack,
}) => {
  const [shakeInput, setShakeInput] = useState(false);
  const navigate = useNavigate();
  const isControlledCustom =
    mode === "custom" && !!(codeProp || guessesProp || hasWonProp);

  const today = useTodayKey(() => {
    if (isControlledCustom) return;

    const newDay = todayKey();
    resetAllDailyGameStatesIfNewDay(newDay);
    setGameState(buildInitialGameState(newDay, __testCode));
    setInputDigitsState(Array(4).fill(""));
    setAnimateRow(null);
    setEntryRow(null);
  });

  const [gameState, setGameState] = useState<Record<Mode, SavedMode>>(() =>
    buildInitialGameState(todayKey(), __testCode)
  );

  const [animateRow, setAnimateRow] = useState<null | {
    idx: number;
    type: "win" | "lose";
  }>(null);
  const [entryRow, setEntryRow] = useState<null | number>(null);

  useEffect(() => {
    if (isControlledCustom || !isDailyGameMode(mode)) return;

    const saved = resolveDailyGameState(mode, today);
    setGameState((prev) => ({ ...prev, [mode]: saved }));
  }, [mode, today, isControlledCustom]);

  // Só salva no localStorage se não for modo controlado
  useEffect(() => {
    if (isControlledCustom) return;

    const state = gameState[mode];
    if (isDailyGameMode(mode)) {
      const stored = loadGameState(mode);
      const storedHasProgress =
        stored.date === today &&
        (stored.hasWon || stored.guesses.length > 0);
      const stateIsEmpty =
        state.guesses.length === 0 && !state.hasWon && state.date === today;

      if (storedHasProgress && stateIsEmpty) return;
    }

    saveGameState(mode, state);
  }, [mode, gameState, isControlledCustom, today]);

  // Input controlado ou não
  // Para codigo-mestre: 4 campos de 0 a 99
  const isCodigoMestre = mode === "codigo-mestre";
  const [inputDigitsState, setInputDigitsState] = useState<string[]>(
    Array(4).fill("")
  );
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
    (isDailyMode(mode) ? getModeMaxTries(mode) : Infinity);
  const isLost = !hasWon && guesses.length >= maxTries;
  const isCasual = mode === "casual";
  const isDesafio = mode === "desafio";
  const isDailyUi = isCasual || isDesafio || isCodigoMestre;
  const modeDisplay = isDailyUi ? getModeDisplay(mode) : null;
  const currentAttempt = hasWon || isLost ? guesses.length : guesses.length + 1;
  const progressPercent = Math.min((guesses.length / maxTries) * 100, 100);

  const renderToolbar = (badge?: React.ReactNode) => (
    <div className="flex w-full items-center justify-between">
      <button
        type="button"
        onClick={() => {
          if (onBack) {
            onBack();
          } else {
            navigate(backTo ?? "/desafios");
          }
        }}
        aria-label="Voltar"
        title="Voltar"
        className={isCasual ? "game-toolbar-btn" : "game-toolbar-btn"}
      >
        ⟵
      </button>
      {badge}
      {onOpenStats ? (
        <button
          type="button"
          onClick={() => onOpenStats()}
          aria-label="Ver estatísticas"
          title="Estatísticas"
          className="game-toolbar-btn text-brand"
        >
          <BarChartIcon size={isCasual ? 18 : 20} />
        </button>
      ) : (
        <span className="game-toolbar-btn invisible" aria-hidden />
      )}
    </div>
  );

  const handleChange = (val: string, idx: number) => {
    if (hasWon || isLost) return;
    let valid = false;
    let newVal = val;
    if (isCodigoMestre) {
      // Permite 0-99, aceita até 2 dígitos, não limpa zeros à esquerda para permitir digitação fluida
      if (/^\d{0,2}$/.test(val)) {
        if (val === "" || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 99)) {
          valid = true;
          // NÃO normaliza para string sem zeros à esquerda aqui!
          newVal = val;
        }
      }
    } else {
      if (/^[0-9]?$/.test(val)) valid = true;
    }
    if (!valid) return;
    if (onInputChange) {
      onInputChange(newVal, idx);
      return;
    }
    const next = [...inputDigits];
    next[idx] = newVal;
    setInputDigits(next);
    if (isCodigoMestre) {
      if (newVal.length === 2 && idx < 3) focusField(idx + 1);
    } else if (newVal && idx < 3) {
      focusField(idx + 1);
    }
  };

  const handleGuess = () => {
    if (hasWon || isLost) return;

    let digitsToSubmit = inputDigits;
    if (isCodigoMestre) {
      digitsToSubmit = inputDigits.map((d) =>
        d.length === 1 ? d.padStart(2, "0") : d
      );
    }

    if (digitsToSubmit.some((d) => !d)) {
      setShakeInput(false);
      setTimeout(() => setShakeInput(true), 10);
      setTimeout(() => setShakeInput(false), 350);
      return;
    }
    if (guesses.length >= maxTries) return;

    // Para codigo-mestre, garantir que todos os campos são números válidos 0-99
    if (
      isCodigoMestre &&
      digitsToSubmit.some(
        (d) => isNaN(Number(d)) || Number(d) < 0 || Number(d) > 99
      )
    ) {
      setShakeInput(false);
      setTimeout(() => setShakeInput(true), 10);
      setTimeout(() => setShakeInput(false), 350);
      return;
    }

    if (onGuess) {
      onGuess([...digitsToSubmit]);
      setInputDigits(Array(4).fill(""));
      focusField();
      return;
    }

    // Para codigo-mestre, comparar como string normalizada
    let isCorrect = false;
    if (isCodigoMestre) {
      isCorrect = digitsToSubmit.every((d, i) => {
        const codeVal = secretCode[i];
        return String(Number(d)) === String(Number(codeVal));
      });
    } else {
      isCorrect = digitsToSubmit.join("") === secretCode.join("");
    }
    const nextGuesses = [...guesses, [...digitsToSubmit]];

    setGameState((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode]!,
        guesses: nextGuesses,
        hasWon: prev[mode]!.hasWon || isCorrect,
        date: today,
      },
    }));

    setInputDigits(Array(4).fill(""));
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
            onWin(s, "win");
          }, MODAL_DELAY);
        }, ROW_ANIMATION);
      } else if (nextGuesses.length === maxTries) {
        setAnimateRow({ idx: guesses.length, type: "lose" });
        setTimeout(() => {
          setAnimateRow(null);
          setTimeout(() => {
            const old = loadStats(mode);
            const s: Stats = {
              ...old,
              totalGames: old.totalGames + 1,
              currentStreak: 0,
              bestStreak: old.bestStreak,
              distribution: { ...old.distribution },
            };
            saveStats(mode, s);
            onWin(s, "lose");
          }, MODAL_DELAY);
        }, ROW_ANIMATION);
      }
    }, ENTRY_ANIMATION);
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (hasWon || isLost || guesses.length >= maxTries) return;
    if (inputDigits.some((d) => !d)) return;
    handleGuess();
  };

  let result: "win" | "lose" | null = null;
  let playedToday = false;
  if (mode === "casual" || mode === "desafio" || mode === "codigo-mestre") {
    const stats = loadStats(mode);
    const todayStr = today;
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
    <div
      className={cn(
        "game-shell",
        (isDesafio || isCodigoMestre) && "game-shell-fill"
      )}
    >
      <div
        className={cn(
          "game-panel",
          isDesafio && "game-panel-fill game-panel-desafio",
          isCodigoMestre && "game-panel-fill game-panel-codigo-mestre"
        )}
      >
        <header className="game-header">
          {isDailyUi && modeDisplay ? (
            <>
              {renderToolbar(
                <span
                  className={cn(
                    "game-toolbar-badge max-w-none",
                    isCasual && "bg-success/10 text-success",
                    isDesafio && "bg-brand/10 text-brand",
                    isCodigoMestre && "bg-[#f59e0b]/10 text-[#d97706]"
                  )}
                >
                  {modeDisplay.badge}
                </span>
              )}
              <div className="mt-1.5 pb-0.5 text-center">
                <p className="game-attempt-label">
                  Tentativa {currentAttempt} de {maxTries}
                </p>
                {isCasual ? (
                  <div className="game-progress-track">
                    {Array.from({ length: maxTries }).map((_, index) => (
                      <span
                        key={index}
                        className={cn(
                          "game-progress-step",
                          index < guesses.length
                            ? hasWon && index === guesses.length - 1
                              ? "bg-success"
                              : "bg-brand"
                            : index === guesses.length && !hasWon && !isLost
                              ? "bg-brand/40"
                              : "bg-border/80"
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="game-progress-bar mx-auto mt-2 h-1.5 max-w-[260px] overflow-hidden rounded-full bg-border/80">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isCodigoMestre ? "bg-[#f59e0b]" : "bg-brand"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {renderToolbar(
                <span className="game-attempt-label">
                  Tentativa {currentAttempt} de {maxTries}
                </span>
              )}
            </>
          )}
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleFormSubmit}
        >
        <div
          className={cn(
            "game-main",
            mode === "codigo-mestre" && "justify-center"
          )}
        >
          {playedToday && result === "win" && (
            <div className="game-result-banner game-result-banner-win">
              <span className="text-base leading-none">🎉</span>
              <span>Você acertou o código!</span>
            </div>
          )}
          {playedToday && result === "lose" && (
            <div className="game-result-banner game-result-banner-lose">
              <span className="text-base leading-none">😞</span>
              <span>
                {isCodigoMestre
                  ? "Não foi dessa vez! Veja o código abaixo."
                  : "Não foi dessa vez!"}
              </span>
            </div>
          )}

          {isCodigoMestre ? (
            <div className="game-codigo-mestre-main">
              <CodigoMestreInputRow
                inputDigits={inputDigits}
                onChange={handleChange}
                inputRefs={inputRefs}
                hasWon={hasWon}
                isLost={isLost}
                shakeInput={shakeInput}
              />

              <CodigoMestreFeedback
                guesses={guesses}
                secretCode={secretCode}
                maxTries={maxTries}
                hasWon={hasWon}
                isLost={isLost}
              />

            </div>
          ) : (
            <ActiveInputRow
              inputDigits={inputDigits}
              secretCode={secretCode}
              isCodigoMestre={isCodigoMestre}
              onChange={handleChange}
              inputRefs={inputRefs}
              hasWon={hasWon}
              isLost={isLost}
              guessesLength={guesses.length}
              modoVisual={false}
              shakeInput={shakeInput}
              variant={isDailyUi ? "casual" : "default"}
            />
          )}

          {!isCodigoMestre && (
            <>
              {isCasual && (
                <>
                  <div className="game-legend mt-1">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-[#22c55e]" />
                      Certo
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-[#fbbf24]" />
                      Presente
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-[#e2e8f0]" />
                      Ausente
                    </span>
                  </div>

                  <div className="game-casual-board mt-1">
                    {Array.from({ length: maxTries }).map((_, i) => {
                      const g = guesses[i] ?? ["", "", "", ""];
                      const animateEntry =
                        entryRow === i && g.some((d) => d !== "");
                      const isFilled = i < guesses.length;

                      return (
                        <div key={i} className="game-casual-row">
                          <span
                            className={cn(
                              "game-casual-row-number",
                              isFilled ? "text-brand" : "text-ink-muted"
                            )}
                          >
                            {i + 1}
                          </span>
                          <div className="game-casual-row-guesses">
                            <GuessRow
                              guess={g}
                              code={secretCode}
                              mode={mode}
                              attempt={i + 1}
                              animate={animateRow?.idx === i}
                              animationType={animateRow?.type}
                              animateEntry={animateEntry}
                              staggerEntry={true}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {isDesafio && (
                <>
                  <div className="game-legend mt-1">
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-[#22c55e]" />
                      Certos no lugar
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2.5 rounded-sm bg-[#fbbf24]" />
                      Presentes fora do lugar
                    </span>
                  </div>

                  <div className="game-desafio-board mt-1">
                    <div className="game-desafio-head" aria-hidden>
                      <span>#</span>
                      <span>Palpite</span>
                      <span className="game-desafio-head-stat">Certos</span>
                      <span className="game-desafio-head-stat">Pres.</span>
                    </div>
                    <div className="game-desafio-rows">
                      {Array.from({ length: maxTries }).map((_, i) => {
                      const g = guesses[i] ?? ["", "", "", ""];
                      const isFilled = i < guesses.length;
                      const { correctPlace, correctDigit } = isFilled
                        ? getFeedback(g, secretCode)
                        : { correctPlace: "-", correctDigit: "-" };

                      return (
                        <div
                          key={i}
                          className={cn(
                            "game-desafio-row",
                            isFilled
                              ? "game-desafio-row-filled"
                              : "game-desafio-row-empty",
                            isFilled && "animate-table-row"
                          )}
                        >
                          <span className="game-desafio-row-number">{i + 1}</span>
                          <span className="game-desafio-guess font-mono">
                            {isFilled ? g.join(" ") : "—"}
                          </span>
                          <span
                            className={cn(
                              "game-desafio-badge",
                              isFilled
                                ? "game-desafio-badge-correct"
                                : "game-desafio-badge-empty"
                            )}
                          >
                            {correctPlace}
                          </span>
                          <span
                            className={cn(
                              "game-desafio-badge",
                              isFilled
                                ? "game-desafio-badge-present"
                                : "game-desafio-badge-empty"
                            )}
                          >
                            {correctDigit}
                          </span>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <footer
          className={cn(
            "game-controls",
            (isDesafio || isCodigoMestre) && "game-controls-desafio"
          )}
        >
          <div className="flex w-full justify-center">
            <div
              className={cn(
                isCasual && "game-keypad-casual",
                (isDesafio || isCodigoMestre) && "game-keypad-desafio",
                !isDailyUi && "game-keypad"
              )}
            >
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={cn(
                    isCasual && "game-key-casual",
                    (isDesafio || isCodigoMestre) && "game-key-desafio",
                    !isDailyUi && "game-key"
                  )}
                  disabled={hasWon || isLost}
                  onClick={() => {
                    if (hasWon || isLost) return;
                    if (mode === "codigo-mestre") {
                      let idx = (
                        window as unknown as { codigoMestreFocus?: number }
                      ).codigoMestreFocus;
                      if (typeof idx !== "number" || idx < 0 || idx > 3) {
                        idx = inputDigits.findIndex((d) => d.length < 2);
                        if (idx === -1) idx = 0;
                      }
                      const current = inputDigits[idx] || "";
                      if (current.length < 2) {
                        handleChange(current + String(k), idx);
                      }
                    } else {
                      const idx = inputDigits.indexOf("");
                      if (idx >= 0) handleChange(String(k), idx);
                    }
                  }}
                >
                  {k}
                </button>
              ))}
              <button
                type="button"
                className={cn(
                  isCasual && "game-key-casual",
                  (isDesafio || isCodigoMestre) && "game-key-desafio",
                  !isDailyUi && "game-key"
                )}
                disabled={hasWon || isLost}
                onClick={() => {
                  if (hasWon || isLost) return;
                  if (mode === "codigo-mestre") {
                    let idx = (
                      window as unknown as { codigoMestreFocus?: number }
                    ).codigoMestreFocus;
                    if (typeof idx !== "number" || idx < 0 || idx > 3) {
                      idx = inputDigits.findIndex((d) => d.length < 2);
                      if (idx === -1) idx = 3;
                    }
                    const current = inputDigits[idx] || "";
                    if (current.length > 0) {
                      handleChange(current.slice(0, -1), idx);
                    } else if (idx > 0) {
                      handleChange("", idx - 1);
                    }
                  } else {
                    const last = inputDigits
                      .map((d, j) => (d ? j : -1))
                      .filter((j) => j >= 0)
                      .pop();
                    if (last != null) handleChange("", last);
                  }
                }}
              >
                ⌫
              </button>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <button
              type="submit"
              className={cn(
                isCasual && "game-submit-casual",
                (isDesafio || isCodigoMestre) && "game-submit-desafio",
                !isDailyUi && "game-submit"
              )}
              disabled={hasWon || isLost || guesses.length >= maxTries}
            >
              {isDailyUi ? "Enviar palpite" : "Enviar"}
            </button>
          </div>
        </footer>
        </form>
      </div>
    </div>
  );
};
