import type { Mode } from "./stats";

type DailyMode = Extract<Mode, "casual" | "desafio" | "codigo-mestre">;

export const MODE_DISPLAY: Record<
  DailyMode,
  {
    label: string;
    subtitle: string;
    badge: string;
    description: string;
    difficulty: "Iniciante" | "Avançado" | "Especial";
  }
> = {
  casual: {
    label: "Cores",
    subtitle: "Dica por dígito",
    badge: "Cores · Dica visual",
    description:
      "Cada dígito muda de cor: verde na posição certa, amarelo se existir no código.",
    difficulty: "Iniciante",
  },
  desafio: {
    label: "Contagem",
    subtitle: "Certos e presentes",
    badge: "Contagem · Modo lógico",
    description:
      "Descubra quantos números estão certos e quantos existem fora do lugar.",
    difficulty: "Avançado",
  },
  "codigo-mestre": {
    label: "Código Mestre",
    subtitle: "Modo especial",
    badge: "Código Mestre · Especial",
    description:
      "Use as setas ↑ e ↓ para saber se precisa subir ou descer cada valor de 00 a 99.",
    difficulty: "Especial",
  },
};

export function getModeDisplay(mode: DailyMode) {
  return MODE_DISPLAY[mode];
}

export function isDailyMode(mode: Mode): mode is DailyMode {
  return mode === "casual" || mode === "desafio" || mode === "codigo-mestre";
}

export const MODE_MAX_TRIES: Record<DailyMode, number> = {
  casual: 6,
  desafio: 15,
  "codigo-mestre": 9,
};

export function getModeMaxTries(mode: DailyMode): number {
  return MODE_MAX_TRIES[mode];
}

export const MODE_ROUTES: Record<DailyMode, string> = {
  casual: "/cores",
  desafio: "/contagem",
  "codigo-mestre": "/codigo-mestre",
};

const PATH_TO_MODE: Record<string, DailyMode> = {
  casual: "casual",
  cores: "casual",
  desafio: "desafio",
  contagem: "desafio",
  "codigo-mestre": "codigo-mestre",
};

export function getModeRoute(mode: DailyMode): string {
  return MODE_ROUTES[mode];
}

export function resolveModeFromPath(pathSegment: string): DailyMode | null {
  return PATH_TO_MODE[pathSegment] ?? null;
}

export function getModeLabel(modo: string): string {
  if (modo in MODE_DISPLAY) {
    return MODE_DISPLAY[modo as DailyMode].label;
  }

  return modo.charAt(0).toUpperCase() + modo.slice(1);
}

export const CUSTOM_ROOM_MODES = [
  "casual",
  "desafio",
  "codigo-mestre",
] as const;

export type CustomRoomMode = (typeof CUSTOM_ROOM_MODES)[number];

export function isCustomRoomMode(m: string): m is CustomRoomMode {
  return (CUSTOM_ROOM_MODES as readonly string[]).includes(m);
}
