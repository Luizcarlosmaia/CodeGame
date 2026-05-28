import React, { useMemo } from "react";

import { cn } from "../../lib/cn";

import type { RoomRanking, RoomPlayer, RoomType, RankingPeriodo } from "../../types/customRoom";

import {

  filterRankingByPlayed,

  formatPlayerPlayStats,

  formatRoomLifetime,

  getPlayerPlayStats,

} from "../../utils/customRoomStats";

import { filterProgressForRoom } from "../../utils/customRoomProgress";
import {
  formatRankingPeriodoDescription,
  formatRankingPeriodoLabel,
  formatRankingResetCountdown,
} from "../../utils/customRoomRankingPeriod";



interface CustomRoomRankingProps {

  ranking: RoomRanking[];

  membros: RoomPlayer[];

  userId: string;

  showStatus?: boolean;

  totalRodadas: number;

  roomType?: RoomType;

  roomCreatedAt?: string;

  partidaNumero?: number;

  rankingPeriodo?: RankingPeriodo;

  rankingResetEm?: string;

}



function getMedal(position: number): string | null {

  if (position === 0) return "🥇";

  if (position === 1) return "🥈";

  if (position === 2) return "🥉";

  return null;

}



const CustomRoomRanking: React.FC<CustomRoomRankingProps> = ({

  ranking,

  membros,

  userId,

  showStatus = true,

  totalRodadas,

  roomType = "permanente",

  roomCreatedAt,

  partidaNumero,

  rankingPeriodo = "nunca",

  rankingResetEm,

}) => {
  const roomScope =
    roomType === "temporaria"
      ? ({ type: "temporaria" as const, partidaNumero })
      : ({ type: "permanente" as const, partidaNumero: undefined });

  const playedRanking = useMemo(

    () => filterRankingByPlayed(ranking, membros, roomScope),

    [ranking, membros, roomScope.type, roomScope.partidaNumero]

  );



  const isPermanentRoom = roomType === "permanente";

  const roomLifetime =
    isPermanentRoom && roomCreatedAt
      ? formatRoomLifetime(roomCreatedAt)
      : null;
  const rankingPeriodLabel = isPermanentRoom
    ? formatRankingPeriodoLabel(rankingPeriodo)
    : null;
  const rankingPeriodHint = isPermanentRoom
    ? formatRankingPeriodoDescription(rankingPeriodo)
    : null;
  const rankingResetLabel =
    isPermanentRoom && rankingPeriodo !== "nunca"
      ? formatRankingResetCountdown(rankingResetEm)
      : null;

  const rankingMeta = (
    <>
      {roomLifetime && (
        <p className="mb-1 text-xs font-medium text-ink-muted">{roomLifetime}</p>
      )}
      {rankingPeriodLabel && (
        <p className="mb-1 text-xs font-semibold text-ink">{rankingPeriodLabel}</p>
      )}
      {rankingPeriodHint && (
        <p className="mb-1 text-xs text-ink-muted">{rankingPeriodHint}</p>
      )}
      {rankingResetLabel && (
        <p className="mb-3 text-xs font-medium text-brand">{rankingResetLabel}</p>
      )}
    </>
  );

  if (!playedRanking.length) {
    return (
      <div>
        {rankingMeta}

        <p className="rounded-xl bg-background px-4 py-5 text-center text-sm text-ink-muted">

          Sem ranking ainda. Quem completar pelo menos uma rodada aparece aqui.

        </p>

      </div>

    );

  }



  return (
    <div>
      {rankingMeta}
      <ol className="m-0 space-y-2 p-0">

        {playedRanking.map((entry, index) => {

          const medal = getMedal(index);

          const member = Array.isArray(membros)

            ? membros.find((player) => player.id === entry.playerId)

            : undefined;

          const playStats = getPlayerPlayStats(member?.progresso, roomScope);

          const isUser = entry.playerId === userId;



          let statusLabel = "Sem jogos";

          let statusClass = "bg-background text-ink-muted";



          if (showStatus && member?.progresso) {

            const progressToday = filterProgressForRoom(

              member.progresso,

              roomScope

            );

            const finishedToday = progressToday.filter(

              (progress) => progress.terminou

            ).length;

            const playedToday = progressToday.length;



            if (finishedToday === totalRodadas && totalRodadas > 0) {

              statusLabel = "Concluído";

              statusClass = "bg-success/10 text-success";

            } else if (playedToday > 0) {

              statusLabel = "Em jogo";

              statusClass = "bg-brand/10 text-brand";

            }

          }



          return (

            <li

              key={entry.playerId}

              className={cn(

                "custom-lobby-ranking-row",

                isUser && "custom-lobby-ranking-row-you",

                index === 0 && !isUser && "custom-lobby-ranking-row-leader"

              )}

            >

              <div className="flex min-w-0 flex-1 items-center gap-2">

                <span className="w-7 shrink-0 text-center text-sm font-bold text-ink-muted">

                  {medal ?? `${index + 1}º`}

                </span>

                <div className="min-w-0">

                  <p className="truncate font-semibold text-ink">{entry.nome}</p>

                  <p className="text-xs text-ink-muted">

                    {isPermanentRoom

                      ? formatPlayerPlayStats(playStats)

                      : `${playStats.dias} partida${playStats.dias === 1 ? "" : "s"}`}

                  </p>

                </div>

              </div>



              <div className="flex shrink-0 flex-col items-end gap-1">

                {showStatus && (

                  <span

                    className={cn(

                      "rounded-full px-2 py-0.5 text-[10px] font-bold",

                      statusClass

                    )}

                  >

                    {statusLabel}

                  </span>

                )}

                <span className="font-mono text-sm font-bold tabular-nums text-brand">

                  {entry.pontos} pts

                </span>

              </div>

            </li>

          );

        })}

      </ol>

    </div>

  );

};



export default CustomRoomRanking;

