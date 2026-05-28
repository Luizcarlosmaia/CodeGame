import React from "react";
import { Trophy, XCircle } from "lucide-react";
import { Game } from "../Game";
import type { Mode } from "../../utils/stats";
import { cn } from "../../lib/cn";
import { computeRoundScore } from "../../utils/customRoomStats";
import CustomRoomGuessChips from "./CustomRoomGuessChips";
import { serializeGuess } from "./customRoomGuessDisplay";

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

function closeRoundPanel(
  setRodadaAberta: RodadaPainelProps["setRodadaAberta"],
  setHasFinished: RodadaPainelProps["setHasFinished"]
) {
  setRodadaAberta(null);
  setHasFinished(null);
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
}) => {
  const palpites = guesses.map((guess) => serializeGuess(guess, rodadaInfo.modo));
  const roundScore =
    hasFinished && hasFinished.tries > 0
      ? computeRoundScore(
          rodadaInfo.modo,
          hasFinished.tries,
          hasFinished.win
        )
      : 0;

  return (
    <div className="custom-game-round-overlay">
      <div className="custom-game-round-shell">
        {!hasFinished ? (
          <div className="relative">
            <Game
              mode={rodadaInfo.modo as Mode}
              code={rodadaInfo.code}
              guesses={guesses}
              hasWon={hasWon}
              inputDigits={inputDigits}
              setInputDigits={setInputDigits}
              onGuess={handleGuess}
              maxTriesOverride={rodadaInfo.maxTries}
              onWin={() => {}}
              backTo={roomId ? `/custom/game/${roomId}` : "/desafios"}
              onBack={() => closeRoundPanel(setRodadaAberta, setHasFinished)}
            />
          </div>
        ) : (
          <div className="custom-game-round-result-card">
            <div
              className={cn(
                "custom-game-round-result-badge",
                hasFinished.win
                  ? "custom-game-round-result-badge-win"
                  : "custom-game-round-result-badge-loss"
              )}
            >
              {hasFinished.win ? (
                <Trophy size={32} aria-hidden />
              ) : (
                <XCircle size={32} aria-hidden />
              )}
            </div>

            <h2
              className={cn(
                "custom-game-round-result-title",
                hasFinished.win ? "text-success" : "text-danger"
              )}
            >
              {hasFinished.win ? "Vitória!" : "Rodada encerrada"}
            </h2>

            {roundScore > 0 && (
              <p className="custom-game-round-result-score">+{roundScore} pts</p>
            )}

            {palpites.length > 0 && (
              <CustomRoomGuessChips
                palpites={palpites}
                modo={rodadaInfo.modo}
                terminou
                won={hasFinished.win}
                className="custom-game-round-result-guesses"
              />
            )}

            <p className="mb-6 max-w-sm text-sm text-ink-muted">
              {hasFinished.win ? (
                <>
                  {`${hasFinished.tries} tentativa${hasFinished.tries === 1 ? "" : "s"}. A última tentativa em `}
                  <span className="font-semibold text-success">verde</span>
                  {" é o código correto."}
                </>
              ) : (
                <>
                  {`Você usou todas as ${hasFinished.tries} tentativas. A última em `}
                  <span className="font-semibold text-danger">vermelho</span>
                  {" foi seu palpite final."}
                </>
              )}
            </p>

            <button
              type="button"
              onClick={() => closeRoundPanel(setRodadaAberta, setHasFinished)}
              className="btn-success min-w-[220px] py-3 text-base"
            >
              Voltar para rodadas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomRoomRodadaPainel;
