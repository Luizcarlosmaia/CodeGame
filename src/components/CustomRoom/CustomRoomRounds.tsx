import React from "react";
import type { RoomPlayer } from "../../types/customRoom";
import {
  RoundList,
  RoundItem,
  RoundCard,
  RoundTitle,
  RoundStatus,
  RoundGuessesLabel,
  RoundGuessesList,
  RoundGuess,
  RoundPlayButton,
  RoundEmpty,
} from "./CustomRoomGame.styles";

interface RodadaConfig {
  rodada: number;
  modo?: string;
  codigo?: string;
}

interface RoundsProps {
  rodadas: RodadaConfig[];
  player: RoomPlayer | undefined;
  setRodadaAberta: (rodada: number) => void;
}

export const CustomRoomRounds: React.FC<RoundsProps> = ({
  rodadas,
  player,
  setRodadaAberta,
}) => {
  function todayKey() {
    const d = new Date();
    return d.toISOString().slice(0, 10).replace(/-/g, "");
  }
  return (
    <RoundList>
      {rodadas && rodadas.length > 0 ? (
        rodadas.map((rodada) => {
          const dataHoje = todayKey();
          const progresso = player?.progresso?.find(
            (p) => p.rodada === rodada.rodada && p.data === dataHoje
          );
          const tentativas = progresso?.tentativas || 0;
          const terminou = progresso?.terminou;
          let statusLabel = "Sem jogos";
          let statusColor = "#888";
          let statusBg = "#f1f5fa";
          if (progresso) {
            if (terminou) {
              statusLabel = "Concluído";
              statusColor = "#388e3c";
              statusBg = "#eafbe7";
            } else {
              statusLabel = "Em jogo";
              statusColor = "#1976d2";
              statusBg = "#e3eaf5";
            }
          }
          return (
            <RoundItem key={rodada.rodada}>
              <RoundCard>
                <RoundTitle>Rodada {rodada.rodada}</RoundTitle>
                <RoundStatus
                  terminou={!!terminou}
                  win={!!progresso?.win}
                  style={{
                    color: statusColor,
                    background: statusBg,
                    borderRadius: 8,
                    padding: "4px 12px",
                    display: "inline-block",
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  {statusLabel}
                  {terminou && tentativas > 0 && (
                    <span
                      style={{
                        color: "#888",
                        fontWeight: 400,
                        marginLeft: 8,
                        fontSize: 13,
                      }}
                    >
                      ({tentativas} tentativa{tentativas === 1 ? "" : "s"})
                    </span>
                  )}
                </RoundStatus>
                {terminou &&
                  progresso?.tentativas &&
                  progresso.tentativas > 0 &&
                  progresso?.palpites &&
                  Array.isArray(progresso.palpites) && (
                    <div>
                      <RoundGuessesLabel>Seus palpites:</RoundGuessesLabel>
                      <RoundGuessesList>
                        {progresso.palpites.map(
                          (palpite: string, i: number) => (
                            <RoundGuess key={i}>
                              {palpite.split("").join(" ")}
                            </RoundGuess>
                          )
                        )}
                      </RoundGuessesList>
                    </div>
                  )}
                {!terminou && (
                  <RoundPlayButton
                    onClick={() => setRodadaAberta(rodada.rodada)}
                  >
                    Jogar rodada
                  </RoundPlayButton>
                )}
              </RoundCard>
            </RoundItem>
          );
        })
      ) : (
        <RoundEmpty>Nenhuma rodada configurada.</RoundEmpty>
      )}
    </RoundList>
  );
};
