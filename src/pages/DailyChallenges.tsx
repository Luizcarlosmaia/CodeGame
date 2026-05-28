import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChallengeModeIllustration } from "../components/ChallengeModeIllustration";
import { cn } from "../lib/cn";
import { getModeRoute, MODE_DISPLAY, MODE_MAX_TRIES } from "../utils/modeLabels";
import { loadGameState, type Mode } from "../utils/gameState";
import { isDailyChallengeFinished } from "../utils/dailyReset";
import { loadStats } from "../utils/stats";
import { useTodayKey } from "../hooks/useTodayKey";

type ChallengeMode = Extract<Mode, "casual" | "desafio" | "codigo-mestre">;

type ChallengeOption = {
  id: ChallengeMode;
  to: string;
  label: string;
  subtitle: string;
  description: string;
  difficulty: string;
  maxTries: number;
  accent: string;
  difficultyClass: string;
  recommended?: boolean;
};

const MODE_META: Record<
  ChallengeMode,
  {
    maxTries: number;
    accent: string;
    difficultyClass: string;
    recommended?: boolean;
  }
> = {
  casual: {
    maxTries: 6,
    accent: "bg-success/10 ring-success/20",
    difficultyClass: "bg-success/10 text-success",
    recommended: true,
  },
  desafio: {
    maxTries: 15,
    accent: "bg-brand/10 ring-brand/20",
    difficultyClass: "bg-brand/10 text-brand",
  },
  "codigo-mestre": {
    maxTries: MODE_MAX_TRIES["codigo-mestre"],
    accent: "bg-[#f59e0b]/10 ring-[#f59e0b]/20",
    difficultyClass: "bg-[#f59e0b]/10 text-[#d97706]",
  },
};

const options: ChallengeOption[] = (
  Object.keys(MODE_META) as ChallengeMode[]
).map((id) => ({
  id,
  to: getModeRoute(id),
  ...MODE_META[id],
  label: MODE_DISPLAY[id].label,
  subtitle: MODE_DISPLAY[id].subtitle,
  description: MODE_DISPLAY[id].description,
  difficulty: MODE_DISPLAY[id].difficulty,
}));

type ModeStatus = {
  status: "completed" | "in_progress" | "new";
  triesUsed: number;
  streak: number;
};

function formatTodayDate(): string {
  const formatted = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function getModeStatus(mode: ChallengeMode, today: string): ModeStatus {
  const saved = loadGameState(mode);
  const stats = loadStats(mode);
  const isToday = saved.date === today;
  const maxTries = MODE_MAX_TRIES[mode];

  if (isToday && isDailyChallengeFinished(mode, today, maxTries)) {
    return {
      status: "completed",
      triesUsed: saved.guesses.length,
      streak: stats.currentStreak,
    };
  }

  if (isToday && saved.guesses.length > 0) {
    return {
      status: "in_progress",
      triesUsed: saved.guesses.length,
      streak: stats.currentStreak,
    };
  }

  return {
    status: "new",
    triesUsed: 0,
    streak: stats.currentStreak,
  };
}

function getStatusLabel(status: ModeStatus["status"]): string {
  if (status === "completed") return "Concluído hoje";
  if (status === "in_progress") return "Em andamento";
  return "Novo hoje";
}

function getActionLabel(status: ModeStatus["status"]): string {
  if (status === "completed") return "Ver resultado";
  if (status === "in_progress") return "Continuar";
  return "Jogar agora";
}

const DailyChallenges: React.FC = () => {
  const navigate = useNavigate();
  const today = useTodayKey();

  const modeStatuses = useMemo(
    () =>
      Object.fromEntries(
        options.map((option) => [
          option.id,
          getModeStatus(option.id, today),
        ])
      ) as Record<ChallengeMode, ModeStatus>,
    [today]
  );

  const completedCount = options.filter(
    (option) => modeStatuses[option.id].status === "completed"
  ).length;

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="h-16" aria-hidden />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -right-24 top-0 size-[420px] rounded-full bg-brand/6 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-[360px] rounded-full bg-success/6 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-brand">
              Desafio do dia
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Desafios Diários
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Um novo código a cada dia. Escolha o modo e tente resolver com o
              menor número de tentativas.
            </p>

            <p className="mt-3 text-sm font-medium text-ink-soft sm:text-base">
              {formatTodayDate()}
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-2xl border border-border/60 bg-surface px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-ink-muted">
                Progresso de hoje
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink">
                {completedCount}{" "}
                <span className="text-base font-semibold text-ink-muted">
                  de {options.length} concluídos
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/ajuda")}
              className="rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-ink-soft transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
            >
              Como funcionam os modos?
            </button>
          </div>

          <div className="mx-auto mt-8 grid w-full max-w-5xl gap-5 lg:mt-10 lg:grid-cols-3 lg:gap-6">
            {options.map((option) => {
              const modeStatus = modeStatuses[option.id];
              const statusLabel = getStatusLabel(modeStatus.status);
              const actionLabel = getActionLabel(modeStatus.status);

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => navigate(option.to)}
                  aria-label={`${option.label}: ${actionLabel}`}
                  className={cn(
                    "group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                    option.recommended && "ring-1 ring-success/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex min-h-[220px] items-center justify-center px-4 py-6 ring-1 ring-inset sm:px-6 sm:py-8",
                      option.accent
                    )}
                  >
                    <ChallengeModeIllustration mode={option.id} />
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-bold",
                          option.difficultyClass
                        )}
                      >
                        {option.difficulty}
                      </span>

                      {option.recommended && (
                        <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                          Recomendado
                        </span>
                      )}

                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          modeStatus.status === "completed" &&
                            "bg-success/10 text-success",
                          modeStatus.status === "in_progress" &&
                            "bg-brand/10 text-brand",
                          modeStatus.status === "new" &&
                            "bg-background text-ink-muted"
                        )}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink-muted">
                        {option.subtitle}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-ink sm:text-2xl">
                        {option.label}
                      </h2>
                    </div>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted sm:text-[0.9375rem]">
                      {option.description}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4 text-sm">
                      <span className="rounded-lg bg-background px-3 py-1.5 font-medium text-ink-soft">
                        Até {option.maxTries} tentativas
                      </span>

                      {modeStatus.triesUsed > 0 && (
                        <span className="rounded-lg bg-background px-3 py-1.5 font-medium text-ink-muted">
                          {modeStatus.triesUsed} usada
                          {modeStatus.triesUsed === 1 ? "" : "s"}
                        </span>
                      )}

                      {modeStatus.streak > 0 && (
                        <span className="rounded-lg bg-[#fff7d1] px-3 py-1.5 font-medium text-[#b45309]">
                          🔥 {modeStatus.streak} dia
                          {modeStatus.streak === 1 ? "" : "s"} seguido
                          {modeStatus.streak === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-base font-semibold text-brand transition-colors group-hover:text-brand-hover">
                        {actionLabel}
                      </span>
                      <span
                        aria-hidden
                        className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyChallenges;
