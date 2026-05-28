import type { Mode } from "./stats";
import { getModeMaxTries, getModeRoute, MODE_DISPLAY } from "./modeLabels";

type DailyMode = Extract<Mode, "casual" | "desafio" | "codigo-mestre">;

export interface GameGuideEntry {
  id: DailyMode;
  icon: string;
  route: string;
  maxTries: number;
  accent: string;
  badgeClass: string;
  ringClass: string;
  objective: string;
  howToPlay: string[];
  feedbackTitle: string;
  feedbackItems: { label: string; description: string; swatch?: string }[];
  tip: string;
}

export const GAME_GUIDE: GameGuideEntry[] = [
  {
    id: "casual",
    icon: "🎨",
    route: getModeRoute("casual"),
    maxTries: getModeMaxTries("casual"),
    accent: "border-success/30 bg-success/5",
    badgeClass: "bg-success/10 text-success",
    ringClass: "ring-success/25",
    objective:
      "Descubra o código secreto de 4 dígitos (0–9) usando dicas visuais a cada palpite.",
    howToPlay: [
      "Digite 4 números e envie o palpite.",
      "Observe a cor de cada dígito na linha enviada.",
      "Ajuste a combinação até acertar ou esgotar as tentativas.",
    ],
    feedbackTitle: "Cores de cada dígito",
    feedbackItems: [
      {
        label: "Verde",
        description: "Dígito certo na posição certa.",
        swatch: "bg-success",
      },
      {
        label: "Amarelo",
        description: "Dígito existe no código, mas em outra posição.",
        swatch: "bg-[#facc15]",
      },
      {
        label: "Cinza",
        description: "Dígito não faz parte do código.",
        swatch: "bg-ink-muted/40",
      },
    ],
    tip: "Comece testando dígitos diferentes para mapear o que existe no código antes de fixar posições.",
  },
  {
    id: "desafio",
    icon: "🧮",
    route: getModeRoute("desafio"),
    maxTries: getModeMaxTries("desafio"),
    accent: "border-brand/30 bg-brand/5",
    badgeClass: "bg-brand/10 text-brand",
    ringClass: "ring-brand/25",
    objective:
      "Acerte o código de 4 dígitos usando apenas a contagem de acertos — sem dica por posição.",
    howToPlay: [
      "Envie palpites com 4 números de 0 a 9.",
      "Receba quantos dígitos estão corretos no total (posição + presença).",
      "Use lógica para eliminar combinações impossíveis.",
    ],
    feedbackTitle: "Contagem do palpite",
    feedbackItems: [
      {
        label: "Verdes",
        description: "Quantidade de dígitos na posição correta.",
      },
      {
        label: "Amarelos",
        description: "Quantidade de dígitos corretos fora da posição.",
      },
    ],
    tip: "Anote cada palpite e a contagem — padrões repetidos eliminam muitas possibilidades de uma vez.",
  },
  {
    id: "codigo-mestre",
    icon: "🎯",
    route: getModeRoute("codigo-mestre"),
    maxTries: getModeMaxTries("codigo-mestre"),
    accent: "border-accent/30 bg-accent/5",
    badgeClass: "bg-accent/10 text-accent",
    ringClass: "ring-accent/25",
    objective:
      "Decifre 4 valores de 00 a 99 com setas que indicam se cada campo precisa subir ou descer.",
    howToPlay: [
      "Preencha os 4 campos (0–99) e envie o palpite.",
      "Veja as setas ↑ e ↓ em cada posição.",
      "↑ significa que o valor real é maior; ↓ que é menor.",
    ],
    feedbackTitle: "Setas por campo",
    feedbackItems: [
      {
        label: "↑ Subir",
        description: "Seu número está abaixo do correto naquela posição.",
      },
      {
        label: "↓ Descer",
        description: "Seu número está acima do correto naquela posição.",
      },
      {
        label: "Acerto",
        description: "Quando acertar, o campo fica marcado como correto.",
      },
    ],
    tip: "Divida o intervalo 0–99 ao meio em cada campo — a busca fica bem mais rápida.",
  },
];

export function getGameGuideLabel(id: DailyMode): string {
  return MODE_DISPLAY[id].label;
}
