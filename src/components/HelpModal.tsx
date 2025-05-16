// src/components/HelpModal.tsx
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
            <li>Use o teclado na tela para inserir cada dígito (0–9).</li>
            <li>⌫ apaga o último dígito.</li>
            <li>↵ envia o palpite.</li>
          </ul>

          <h3>Ações (modo Treino)</h3>
          <ul>
            <li>
              <strong>Limpar Rodada</strong> – limpa todos os palpites.
            </li>
            <li>
              <strong>Novo Jogo</strong> – gera um novo código e zera o
              histórico.
            </li>
          </ul>

          <h3>Modos de Jogo</h3>
          <ul>
            <li>
              <strong>Casual</strong> – 6 tentativas, feedback colorido por
              posição/existência.
            </li>
            <li>
              <strong>Desafio</strong> – 15 tentativas, mostra apenas totais de
              acertos.
            </li>
            <li>
              <strong>Custom</strong> – modo livre, jogue com amigos, zera com
              botão “Limpar / Novo Jogo”.
            </li>
          </ul>
        </ModalContent>
      </ModalBox>
    </Overlay>
  );
};
