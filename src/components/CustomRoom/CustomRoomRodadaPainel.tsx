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
}) => (
  <RodadaPainelContainer>
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
