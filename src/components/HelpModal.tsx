import React from "react";
import {
  Overlay,
  ModalBox,
  ModalHeader,
  ModalContent,
  CloseButton,
} from "../styles/AppStyles";

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Como jogar</h2>
          <CloseButton onClick={onClose} aria-label="Fechar">
            ×
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <h3>Controles</h3>
          <ul>
            <li>Teclado on-screen para digitar (0–9).</li>
            <li>⌫ apaga; ↵ envia.</li>
          </ul>

          <h3>Ações</h3>
          <ul>
            <li>Limpar Rodada – limpa palpites.</li>
            <li>Novo Jogo – reinicia código e histórico.</li>
          </ul>

          <h3>Modos</h3>
          <ul>
            <li>Izy – feedback colorido por posição/existência.</li>
            <li>Nerd – apenas totais de acertos.</li>
          </ul>
        </ModalContent>
      </ModalBox>
    </Overlay>
  );
};
