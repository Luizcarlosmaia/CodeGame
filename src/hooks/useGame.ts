// src/hooks/useGame.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { generateCode } from "../utils/generateCode";
import { generateDailyCode } from "../utils/generateDailyCode";
import {
  loadStats,
  saveStats,
  todayKey,
  type Mode,
  type Stats,
} from "../utils/stats";
import {
  loadGameState,
  saveGameState,
  type SavedMode,
} from "../utils/gameState";

export function useGame(mode: Mode, onWin: (stats: Stats) => void) {
  // --- 1) carregar e armazenar estado completo por modo ---
  const [gameState, setGameState] = useState<Record<Mode, SavedMode>>(() => ({
    casual: loadGameState("casual"),
    desafio: loadGameState("desafio"),
    custom: loadGameState("custom"),
  }));

  // --- 2) reset diário ---
  const todayRef = useRef(todayKey());
  useEffect(() => {
    const today = todayKey();
    if (today !== todayRef.current) {
      todayRef.current = today;
      const daily = generateDailyCode(today);
      setGameState((prev) => ({
        casual: { ...prev.casual, code: daily, guesses: [], hasWon: false },
        desafio: { ...prev.desafio, code: daily, guesses: [], hasWon: false },
        custom: prev.custom,
      }));
    }
  }, []);

  // --- 3) persistir sempre que o modo for alterado ---
  useEffect(() => {
    saveGameState(mode, gameState[mode]!);
  }, [mode, gameState]);

  // --- 4) dígitos de input + foco ---
  const [input, setInput] = useState(["", "", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const focus = (i = 0) => refs.current[i]?.focus();
  useEffect(focus, []);

  // --- 5) helpers e handlers ---
  const { code: secretCode, guesses, hasWon } = gameState[mode]!;

  const maxTries = mode === "casual" ? 6 : mode === "desafio" ? 15 : Infinity;
  const attempt = guesses.length;

  const change = useCallback((val: string, idx: number) => {
    if (!/^[0-9]?$/.test(val)) return;
    setInput((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    if (val && idx < 3) focus(idx + 1);
  }, []);

  const guess = useCallback(() => {
    if (hasWon || input.some((d) => !d) || attempt >= maxTries) return;

    const isRight = input.join("") === secretCode.join("");
    const nextGuesses = [...guesses, [...input]];

    setGameState((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode]!,
        guesses: nextGuesses,
        hasWon: prev[mode]!.hasWon || isRight,
      },
    }));

    setInput(["", "", "", ""]);
    focus();

    if (isRight) {
      // estatísticas
      const old = loadStats(mode);
      const used = nextGuesses.length;
      const stats: Stats = {
        ...old,
        totalGames: old.totalGames + 1,
        totalWins: old.totalWins + 1,
        currentStreak: old.currentStreak + 1,
        bestStreak: Math.max(old.bestStreak, old.currentStreak + 1),
        distribution: {
          ...old.distribution,
          [used]: (old.distribution[used] || 0) + 1,
        },
      };
      saveStats(mode, stats);
      onWin(stats);
    }
  }, [attempt, guesses, hasWon, input, mode, secretCode, maxTries, onWin]);

  const clear = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      custom: { ...prev.custom!, guesses: [], hasWon: false },
    }));
    setInput(["", "", "", ""]);
    focus();
  }, []);

  const restart = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      custom: { ...prev.custom!, code: generateCode() },
    }));
    clear();
  }, [clear]);

  // --- 6) retornar tudo que o Game precisa ---
  return {
    secretCode,
    guesses,
    hasWon,
    maxTries,
    input,
    refs,
    change,
    guess,
    clear,
    restart,
    attempt,
  };
}
