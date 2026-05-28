import React from "react";
import { cn } from "../../lib/cn";
import {
  formatPalpiteDisplay,
  getGuessChipClassName,
} from "./customRoomGuessDisplay";

interface CustomRoomGuessChipsProps {
  palpites: string[];
  modo: string;
  terminou?: boolean;
  won?: boolean;
  className?: string;
}

const CustomRoomGuessChips: React.FC<CustomRoomGuessChipsProps> = ({
  palpites,
  modo,
  terminou = false,
  won = false,
  className,
}) => {
  if (!palpites.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {palpites.map((palpite, index) => {
        const isLast = index === palpites.length - 1;

        return (
          <span
            key={`${palpite}-${index}`}
            className={getGuessChipClassName(isLast, terminou, won)}
            title={
              isLast && terminou
                ? won
                  ? "Código correto"
                  : "Última tentativa"
                : undefined
            }
          >
            {formatPalpiteDisplay(palpite, modo)}
          </span>
        );
      })}
    </div>
  );
};

export default CustomRoomGuessChips;
