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
  appVersion?: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  onClose,
  appVersion,
}) => {
  const version = appVersion ?? import.meta.env.VITE_APP_VERSION;
  return (
    <Overlay data-testid="modal-overlay" onClick={onClose}>
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
          <h3>Importante sobre sequência de vitórias</h3>
          <ul>
            <li>
              Para manter sua sequência de vitórias, é necessário jogar todos os
              dias. Se você pular um dia sem jogar, sua sequência será zerada
              automaticamente, mesmo que não conte como derrota ou jogo perdido.
            </li>
          </ul>
          <h3>Ações (modo Custom)</h3>
          <ul>
            <li>
              <strong>Limpar Rodada</strong> – limpa todos os palpites.
            </li>
            <li>
              <strong>Novo Jogo</strong> – gera um novo código e zera o
              histórico.
            </li>
          </ul>
          <hr style={{ margin: "1.5em 0" }} />
          <div
            style={{ textAlign: "center", fontSize: "0.95em", color: "#888" }}
          >
            <strong>Versão:</strong> {version}
          </div>
        </ModalContent>
      </ModalBox>
    </Overlay>
  );
};
