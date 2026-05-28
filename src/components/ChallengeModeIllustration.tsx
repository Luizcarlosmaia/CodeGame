import React from "react";
import { cn } from "../lib/cn";
import type { Mode } from "../utils/gameState";

type ChallengeMode = Extract<Mode, "casual" | "desafio" | "codigo-mestre">;

type Props = {
  mode: ChallengeMode;
  className?: string;
};

function MiniCard({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "w-full max-w-[220px] rounded-2xl border border-white/70 bg-surface p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function CasualIllustration() {
  const sampleRow = [
    { digit: "5", color: "bg-[#28a745] text-white" },
    { digit: "1", color: "bg-[#ffc107] text-ink" },
    { digit: "3", color: "bg-[#dee2e6] text-ink-muted" },
    { digit: "7", color: "bg-[#28a745] text-white" },
  ];

  return (
    <MiniCard>
      <p className="mb-2 text-center text-[10px] font-semibold text-ink-muted">
        Tentativa 2 de 6
      </p>

      <div className="mb-2 grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`input-${index}`}
            className={cn(
              "flex h-7 items-end justify-center rounded-md border bg-surface pb-0.5 text-[10px] font-bold",
              index === 0 ? "border-ink" : "border-border"
            )}
          >
            {index === 0 ? "_" : ""}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`grid-${index}`}
            className="h-5 rounded bg-[#e9ecef]"
          />
        ))}
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {sampleRow.map((cell, index) => (
          <div
            key={`sample-${index}`}
            className={cn(
              "flex h-7 items-center justify-center rounded-md text-xs font-bold font-mono",
              cell.color
            )}
          >
            {cell.digit}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1">
        {["7", "8", "9", "4", "5", "6"].map((key) => (
          <div
            key={key}
            className="flex h-5 items-center justify-center rounded bg-[#dee2e6] text-[10px] font-semibold text-ink-soft"
          >
            {key}
          </div>
        ))}
      </div>
    </MiniCard>
  );
}

function DesafioIllustration() {
  const rows = [
    { guess: "5 1 3 7", certos: 2, presentes: 1 },
    { guess: "5 4 2 8", certos: 1, presentes: 0 },
    { guess: "5 9 6 1", certos: 0, presentes: 2 },
  ];

  return (
    <MiniCard className="max-w-[240px]">
      <p className="mb-2 text-center text-[10px] font-semibold text-ink-muted">
        Tentativa 3 de 15
      </p>

      <div className="overflow-hidden rounded-lg border border-border/70">
        <div className="grid grid-cols-[16px_1fr_42px_52px] bg-primary px-1.5 py-1 text-[8px] font-bold uppercase tracking-wide text-white">
          <span>#</span>
          <span>Palpite</span>
          <span className="text-center">Certos</span>
          <span className="text-center">Presentes</span>
        </div>

        {rows.map((row, index) => (
          <div
            key={row.guess}
            className={cn(
              "grid grid-cols-[16px_1fr_42px_52px] items-center px-1.5 py-1 text-[9px]",
              index % 2 === 0 ? "bg-surface" : "bg-[#f8fafc]"
            )}
          >
            <span className="font-semibold text-ink-muted">{index + 1}</span>
            <span className="font-mono font-semibold text-ink">{row.guess}</span>
            <span className="mx-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[#28a745] px-1 text-[8px] font-bold text-white">
              {row.certos}
            </span>
            <span className="mx-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ffc107] px-1 text-[8px] font-bold text-ink">
              {row.presentes}
            </span>
          </div>
        ))}

        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="grid grid-cols-[16px_1fr_42px_52px] items-center px-1.5 py-1 text-[9px] even:bg-[#f8fafc]"
          >
            <span className="text-ink-muted">{rows.length + index + 1}</span>
            <span className="text-ink-muted">—</span>
            <span className="mx-auto h-4 w-4 rounded-full bg-[#dee2e6]" />
            <span className="mx-auto h-4 w-4 rounded-full bg-[#dee2e6]" />
          </div>
        ))}
      </div>
    </MiniCard>
  );
}

function CodigoMestreIllustration() {
  const digits = ["07", "42", "18", "63"];

  return (
    <MiniCard>
      <p className="mb-3 text-center text-[10px] font-semibold text-ink-muted">
        Tentativa 4 de 7
      </p>

      <div className="flex items-center justify-center gap-1.5">
        {digits.map((digit, index) => (
          <div key={digit} className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] font-bold text-[#217a4b]">▲</span>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-surface text-sm font-bold font-mono",
                index === 0 ? "border-ink text-ink" : "border-border text-ink-soft"
              )}
            >
              {digit}
            </div>
            <span className="text-[8px] font-bold text-[#bfa100]">▼</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1">
        {["correct", "present", "absent", "correct"].map((status, index) => (
          <span
            key={`hint-${index}`}
            className={cn(
              "size-2 rounded-full",
              status === "correct" && "bg-[#28a745]",
              status === "present" && "bg-[#ffc107]",
              status === "absent" && "bg-[#dee2e6]"
            )}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-[9px] font-medium text-ink-muted">
        Ajuste cada valor de 00 a 99
      </p>
    </MiniCard>
  );
}

export const ChallengeModeIllustration: React.FC<Props> = ({
  mode,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]",
        className
      )}
      aria-hidden
    >
      {mode === "casual" && <CasualIllustration />}
      {mode === "desafio" && <DesafioIllustration />}
      {mode === "codigo-mestre" && <CodigoMestreIllustration />}
    </div>
  );
};
