// Tipos para salas customizadas (temporárias e permanentes)
export type RoomType = "permanente" | "temporaria";
export type RankingPeriodo = "nunca" | "semanal" | "mensal";
export type RoomMode = "casual" | "desafio" | string;

export interface RoomPlayer {
  id: string;
  nome: string;
  /** Conta logada vinculada a este jogador na sala */
  accountId?: string;
  /** Token para link de retomada em outro aparelho (visitantes) */
  resumeToken?: string;
  terminouRodada: boolean;
  tentativas: number[]; // tentativas por rodada
  progresso?: Array<{
    rodada: number;
    data: string;
    tentativas: number;
    terminou: boolean;
    win?: boolean; // indica se ganhou a rodada
    palpites?: string[]; // histórico dos palpites do usuário na rodada
  }>;
  isOwner?: boolean;
  isMaster?: boolean;
}

export interface RoomRound {
  codigo: string;
  rodada: number;
  modo?: string;
  encerrada: boolean;
  tempoLimite?: number; // segundos
  inicio: string; // ISO
  fim?: string; // ISO
}

export interface RoomRanking {
  playerId: string;
  nome: string;
  pontos: number; // maior é melhor
}

export interface CustomRoom {
  id: string;
  nome: string;
  type: RoomType;
  /** UUID da conta dona (salas criadas após login) */
  accountOwnerId?: string;
  ownerId: string;
  masterId?: string;
  admins: string[];
  membros: RoomPlayer[];
  modo: RoomMode;
  modos?: { modo: string; rodadas: number }[];
  rodadaAtual: number;
  rodadas: RoomRound[];
  ranking: RoomRanking[];
  tempoPorRodada?: number; // segundos
  /** ISO — fim da validade (salas temporárias, 5h após criação) */
  expiraEm?: string;
  /** ISO — quando a sala temporária foi desativada por TTL */
  expiradaEm?: string;
  /** Contador de partidas reiniciadas (temporárias) */
  partidaNumero?: number;
  /** Reset total do ranking: nunca | semanal | mensal (permanentes) */
  rankingPeriodo?: RankingPeriodo;
  /** ISO — próximo reset automático do ranking (permanentes) */
  rankingResetEm?: string;
  codigoDoDia?: string;
  aberta: boolean;
  criadaEm: string;
  fechadaEm?: string;
  progressoRemovidos?: Array<{
    id: string;
    progresso?: RoomPlayer["progresso"];
  }>;
  /** Mapa rodada → modo (inclui rodadas já removidas da config, para pontuação) */
  rodadaModoHistorico?: Record<string, string>;
}
