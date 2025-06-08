import React from "react";
import { Game } from "../Game";
import {
  RodadaPainelContainer,
  RodadaPainelOverlay,
  RodadaPainelResult,
  RodadaPainelButton,
} from "./CustomRoomGame.styles";

interface RodadaPainelProps {
  rodadaInfo: {
    modo: string;
    code: string[];
    maxTries: number;
    rodada: { rodada: number; modo?: string; codigo?: string };
  };
  guesses: string[][];
  hasWon: boolean;
  hasFinished: { win: boolean; tries: number } | null;
  inputDigits: string[];
  setInputDigits: (digits: string[]) => void;
  setGuesses: React.Dispatch<React.SetStateAction<string[][]>>;
  handleGuess: (guess: string[]) => void;
  setRodadaAberta: (rodada: number | null) => void;
  setHasFinished: (val: { win: boolean; tries: number } | null) => void;
  roomId?: string;
}

const CustomRoomRodadaPainel: React.FC<RodadaPainelProps> = ({
  rodadaInfo,
  guesses,
  hasWon,
  hasFinished,
  inputDigits,
  setInputDigits,
  handleGuess,
  setRodadaAberta,
  setHasFinished,
  roomId,
}) => (
  <RodadaPainelContainer>
    {(() => {
      // Debug: loga o modo e o roomId sempre que renderiza

      console.log(
        "[CustomRoomRodadaPainel] modo:",
        rodadaInfo.modo,
        "roomId:",
        roomId
      );
      return null;
    })()}
    <div style={{ position: "relative" }}>
      <Game
        mode={rodadaInfo.modo as "casual" | "desafio" | "custom"}
        code={rodadaInfo.code}
        guesses={guesses}
        hasWon={hasWon}
        inputDigits={inputDigits}
        setInputDigits={setInputDigits}
        onGuess={handleGuess}
        maxTriesOverride={rodadaInfo.maxTries}
        onWin={() => {}}
        backTo={(() => {
          const path = roomId ? `/custom/game/${roomId}` : "/desafios";
          console.log("[Game] backTo:", path);
          return path;
        })()}
        onBack={
          roomId
            ? () => {
                console.log(
                  "[Game] onBack: navigating to",
                  `/custom/game/${roomId}`
                );
                window.location.pathname = `/custom/game/${roomId}`;
              }
            : undefined
        }
      />
      {hasFinished && (
        <RodadaPainelOverlay>
          <RodadaPainelResult win={!!hasFinished.win}>
            {hasFinished.win === true ? "Você ganhou!" : "Você perdeu!"}
          </RodadaPainelResult>
          <RodadaPainelButton
            onClick={() => {
              setRodadaAberta(null);
              setHasFinished(null);
            }}
            type="button"
          >
            Voltar para rodadas
          </RodadaPainelButton>
        </RodadaPainelOverlay>
      )}
    </div>
  </RodadaPainelContainer>
);

export default CustomRoomRodadaPainel;
