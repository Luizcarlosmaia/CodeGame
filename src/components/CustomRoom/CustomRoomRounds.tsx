import React from "react";

import { Play, Trophy } from "lucide-react";

import type { CustomRoom, RoomPlayer } from "../../types/customRoom";

import { cn } from "../../lib/cn";

import { getModeLabel } from "../../utils/modeLabels";

import { computeRoundScore } from "../../utils/customRoomStats";

import { findRoundProgress } from "../../utils/customRoomProgress";

import CustomRoomGuessChips from "./CustomRoomGuessChips";



interface RodadaConfig {

  rodada: number;

  modo?: string;

  codigo?: string;

}



interface RoundsProps {

  rodadas: RodadaConfig[];

  player: RoomPlayer | undefined;

  room: Pick<CustomRoom, "type" | "partidaNumero">;

  setRodadaAberta: (rodada: number) => void;

}



function getModeIcon(modo: string): string {

  if (modo === "casual") return "🎨";

  if (modo === "codigo-mestre") return "🎯";

  return "🧮";

}



export const CustomRoomRounds: React.FC<RoundsProps> = ({
  rodadas,
  player,
  room,
  setRodadaAberta,
}) => {
  return (

    <ul className="custom-game-rounds-list">

      {rodadas && rodadas.length > 0 ? (

        rodadas.map((rodada) => {

          const progresso = findRoundProgress(player, rodada.rodada, room);

          const tentativas = progresso?.tentativas || 0;

          const terminou = progresso?.terminou;

          const won = progresso?.win;

          const modo = rodada.modo || "casual";

          const palpites = progresso?.palpites ?? [];

          const roundScore =

            terminou && tentativas > 0

              ? computeRoundScore(modo, tentativas, !!won)

              : 0;



          let statusLabel = "Não iniciada";

          let statusClass = "custom-game-round-status-new";



          if (progresso) {

            if (terminou) {

              statusLabel = won ? "Vitória" : "Concluída";

              statusClass = won

                ? "custom-game-round-status-win"

                : "custom-game-round-status-done";

            } else {

              statusLabel = "Em andamento";

              statusClass = "custom-game-round-status-active";

            }

          }



          return (

            <li key={rodada.rodada}>

              <article className="custom-game-round-card">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">

                      Rodada {rodada.rodada}

                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-ink">

                      <span aria-hidden>{getModeIcon(modo)}</span>

                      {getModeLabel(modo)}

                    </p>

                  </div>

                  <span

                    className={cn(

                      "custom-game-round-status",

                      statusClass

                    )}

                  >

                    {statusLabel}

                  </span>

                </div>



                {progresso && !terminou && tentativas > 0 && (

                  <p className="mt-2 text-xs text-ink-muted">

                    {tentativas} tentativa{tentativas === 1 ? "" : "s"} hoje

                  </p>

                )}



                {terminou && tentativas > 0 && (

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">

                    {won ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <Trophy size={12} aria-hidden />
                        <span>
                          {`Acertou em ${tentativas} tentativa${tentativas === 1 ? "" : "s"}`}
                        </span>
                      </span>
                    ) : (
                      <span className="text-ink-muted">
                        {`Esgotou em ${tentativas} tentativas`}
                      </span>
                    )}

                    {roundScore > 0 && (

                      <span className="font-mono font-bold tabular-nums text-brand">

                        +{roundScore} pts

                      </span>

                    )}

                  </div>

                )}



                {palpites.length > 0 && (

                  <div className="mt-2">

                    <p className="custom-game-round-guesses-label">Tentativas</p>

                    <CustomRoomGuessChips

                      palpites={palpites}

                      modo={modo}

                      terminou={!!terminou}

                      won={!!won}

                      className="mt-1"

                    />

                  </div>

                )}



                {!terminou && (

                  <div className="mt-3">

                    <button

                      type="button"

                      data-testid={`play-round-${rodada.rodada}`}

                      onClick={() => setRodadaAberta(rodada.rodada)}

                      className="custom-game-round-play"

                    >

                      <Play size={16} aria-hidden />

                      {progresso ? "Continuar rodada" : "Jogar rodada"}

                    </button>

                  </div>

                )}

              </article>

            </li>

          );

        })

      ) : (

        <li className="custom-create-section text-sm text-ink-muted">

          Nenhuma rodada configurada.

        </li>

      )}

    </ul>

  );

};

