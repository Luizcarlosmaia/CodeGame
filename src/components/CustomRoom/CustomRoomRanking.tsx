import React from "react";
import { RankingList } from "./CustomRoomGame.styles";
import type { RoomRanking, RoomPlayer } from "../../types/customRoom";

interface CustomRoomRankingProps {
  ranking: RoomRanking[];
  membros: RoomPlayer[];
  userId: string;
}

interface CustomRoomRankingProps {
  ranking: RoomRanking[];
  membros: RoomPlayer[];
  userId: string;
  showStatus?: boolean;
  totalRodadas: number;
}

const CustomRoomRanking: React.FC<CustomRoomRankingProps> = ({
  ranking,
  membros,
  userId,
  showStatus = true,
  totalRodadas,
}) => {
  return ranking && ranking.length > 0 ? (
    <RankingList>
      {ranking.map((r, i) => {
        const pos = `${i + 1}º`;
        const membro = Array.isArray(membros)
          ? membros.find((m) => m.id === r.playerId)
          : undefined;
        const partidas = membro?.progresso
          ? new Set(membro.progresso.map((p) => p.data)).size
          : 0;
        const isUser = r.playerId === userId;

        // Status visual (sem jogos, em jogo, concluído) — só do dia atual
        let statusLabel = "Sem jogos";
        let statusColor = "#888";
        let statusBg = "#f1f5fa";
        if (showStatus && membro?.progresso) {
          const dataHoje = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
          // Progresso do dia atual
          const progressoHoje = membro.progresso.filter(
            (p) => p.data === dataHoje
          );
          const concluidasHoje = progressoHoje.filter((p) => p.terminou).length;
          const jogadasHoje = progressoHoje.length;
          if (concluidasHoje === totalRodadas && totalRodadas > 0) {
            statusLabel = "Concluído";
            statusColor = "#388e3c";
            statusBg = "#eafbe7";
          } else if (jogadasHoje > 0) {
            statusLabel = "Em jogo";
            statusColor = "#1976d2";
            statusBg = "#e3eaf5";
          }
        }

        return (
          <RankingItem key={r.playerId} $isUser={isUser} $isFirst={i === 0}>
            <RankingPos>{pos}</RankingPos>
            <RankingName>{r.nome}</RankingName>
            <RankingPartidas>
              — {partidas} partida{partidas === 1 ? "" : "s"}
            </RankingPartidas>
            {showStatus && (
              <span
                style={{
                  color: statusColor,
                  background: statusBg,
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 10,
                  marginLeft: 8,
                  minWidth: 70,
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                {statusLabel}
              </span>
            )}
            <RankingPontos>{r.pontos} pts</RankingPontos>
          </RankingItem>
        );
      })}
    </RankingList>
  ) : (
    <RankingEmpty>Sem ranking ainda.</RankingEmpty>
  );
};

export default CustomRoomRanking;

// Styled components for ranking items
import styled from "styled-components";

const RankingItem = styled.li<{
  $isUser: boolean;
  $isFirst: boolean;
}>`
  margin-bottom: 5px;
  font-weight: ${({ $isFirst }) => ($isFirst ? 700 : 500)};
  color: ${({ $isUser, $isFirst }) =>
    $isUser ? "#388e3c" : $isFirst ? "#1976d2" : "#333"};
  font-size: 10px;
  background: ${({ $isUser }) => ($isUser ? "#eafbe7" : "none")};
  border-radius: ${({ $isUser }) => ($isUser ? 7 : 0)}px;
  display: flex;
  align-items: flex-start; // Corrigido aqui
  gap: 0.2rem;
`;

const RankingPos = styled.span`
  min-width: 28px;
  font-weight: 700;
  @media (max-width: 800px) {
    font-size: 9px;
  }
`;

const RankingName = styled.span`
  font-weight: 600;
  @media (max-width: 800px) {
    font-size: 9px;
  }
`;

const RankingPartidas = styled.span`
  color: #888;
  font-size: 10px;
  margin-left: 2px;
  @media (max-width: 800px) {
    font-size: 9px;
  }
`;

const RankingPontos = styled.span`
  margin-left: auto;
  font-weight: 700;
  @media (max-width: 800px) {
    font-size: 9px;
  }
`;

const RankingEmpty = styled.div`
  color: #888;
`;
