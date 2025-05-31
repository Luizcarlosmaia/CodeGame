// Tipos para salas customizadas (temporárias e fixas)

// Pronto para outros tipos no futuro, mas só "permanente" por enquanto
export type RoomType = "permanente";
export type RoomMode = "casual" | "desafio" | string; // pronto para novos modos

export interface RoomPlayer {
  id: string;
  nome: string;
  terminouRodada: boolean;
  tentativas: number[]; // tentativas por rodada
  progresso?: Array<{
    rodada: number;
    data: string;
    tentativas: number;
    terminou: boolean;
    win?: boolean; // indica se ganhou a rodada
    palpites?: string[]; // histórico dos palpites do usuário na rodada (serializado para Firestore)
  }>;
  isOwner?: boolean;
  isMaster?: boolean;
}

export interface RoomRound {
  codigo: string;
  rodada: number;
  encerrada: boolean;
  tempoLimite?: number; // segundos
  inicio: string; // ISO
  fim?: string; // ISO
}

export interface RoomRanking {
  playerId: string;
  nome: string;
  pontos: number; // menor é melhor
}

export interface CustomRoom {
  id: string;
  nome: string;
  type: RoomType;
  ownerId: string;
  masterId?: string;
  admins: string[];
  membros: RoomPlayer[];
  modo: RoomMode;
  rodadaAtual: number;
  rodadas: RoomRound[];
  ranking: RoomRanking[];
  tempoPorRodada?: number; // segundos
  codigoDoDia?: string; // para salas fixas
  aberta: boolean;
  criadaEm: string;
  fechadaEm?: string;
  progressoRemovidos?: Array<{
    id: string;
    progresso?: RoomPlayer["progresso"];
  }>;
}
