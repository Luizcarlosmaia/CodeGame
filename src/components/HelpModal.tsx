// src/components/HelpModal.tsx
import React from "react";
import {
  Overlay,
  ModalBox,
  ModalHeader,
  ModalContent,
  CloseButton,
} from "../styles/AppStyles";
import amostraTentativasImg from "../img/amostra-tentativas.png";
import cadeadoImg from "../img/cadeado-com-4-digitos.png";

interface HelpModalProps {
  onClose: () => void;
  appVersion?: string;
  tutorial?: boolean;
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
        <ModalContent
          style={{
            background: "#f8fafc",
            borderRadius: 16,
            boxShadow: "0 2px 16px #0002",
            padding: 24,
            maxWidth: 420,
            margin: "0 auto",
            color: "#23272f",
            fontFamily: `'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
            fontSize: 15.5,
            letterSpacing: 0.01,
            lineHeight: 1.7,
            overflowY: "auto",
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: "#e0e0e0 #f8fafc", // Firefox
          }}
        >
          {/* Suaviza a barra de rolagem no Chrome/Safari/Edge */}
          <style>{`
            .modal-content::-webkit-scrollbar {
              width: 7px;
              background: #f8fafc;
            }
            .modal-content::-webkit-scrollbar-thumb {
              background: #e0e0e0;
              border-radius: 8px;
            }
            .modal-content::-webkit-scrollbar-thumb:hover {
              background: #bdbdbd;
            }
          `}</style>
          {/* 1. Boas-vindas e Objetivo */}
          <h3
            style={{
              marginBottom: 8,
              fontFamily: `'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif`,
              fontWeight: 800,
              fontSize: 22,
              color: "#1a237e",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              textAlign: "center",
              width: "100%",
              display: "block",
            }}
          >
            Bem-vindo ao Code Game!
          </h3>
          <p
            style={{
              marginBottom: 8,
              fontSize: 16.5,
              fontWeight: 500,
              color: "#222",
              fontFamily: "inherit",
            }}
          >
            Descubra o <strong>código secreto de 4 dígitos</strong>.
          </p>
          <div style={{ textAlign: "center", margin: "0.5em 0 1.2em 0" }}>
            <img
              src={cadeadoImg}
              alt="Cadeado com 4 dígitos"
              style={{ maxWidth: 120, width: "100%", height: "auto" }}
            />
          </div>

          {/* 2. Como Jogar */}
          <h3
            style={{
              marginBottom: 8,
              fontFamily: `'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif`,
              fontWeight: 700,
              fontSize: 18,
              color: "#1976d2",
              letterSpacing: 0.2,
            }}
          >
            Como jogar
          </h3>
          <ol style={{ marginBottom: 12, paddingLeft: 20 }}>
            <li>Digite 4 números usando o teclado na tela.</li>
            <li>
              Apague com <strong>⌫</strong> se errar.
            </li>
            <li>Envie o palpite e veja o feedback.</li>
          </ol>

          {/* 3. Modos de Jogo */}
          <h3
            style={{
              marginBottom: 8,
              fontFamily: `'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif`,
              fontWeight: 700,
              fontSize: 18,
              color: "#1976d2",
              letterSpacing: 0.2,
            }}
          >
            Modos de Jogo
          </h3>
          <ul style={{ marginBottom: 12 }}>
            <li>
              <strong>Casual:</strong> 6 tentativas, feedback colorido por
              posição.
            </li>
            <li>
              <strong>Desafio:</strong> 15 tentativas, feedback só com totais.
            </li>
            <li>
              <strong>Custom:</strong> modo livre para jogar com amigos.
            </li>
          </ul>

          {/* 4. Exemplo de Jogada */}
          <h3
            style={{
              marginBottom: 8,
              fontFamily: `'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif`,
              fontWeight: 700,
              fontSize: 18,
              color: "#1976d2",
              letterSpacing: 0.2,
            }}
          >
            Exemplo de Jogada
          </h3>
          <div style={{ textAlign: "center", margin: "0.5em 0 1.2em 0" }}>
            <img
              src={amostraTentativasImg}
              alt="Exemplo de tentativas com feedback colorido"
              style={{
                maxWidth: 220,
                width: "100%",
                height: "auto",
                borderRadius: 8,
                boxShadow: "0 1px 6px #0001",
              }}
            />
          </div>
          <ul style={{ marginBottom: 12 }}>
            <li>🟩 Verde: dígito certo na posição certa</li>
            <li>🟨 Amarelo: dígito existe, mas em outra posição</li>
            <li>⬜ Cinza: dígito não existe no código</li>
          </ul>

          {/* 5. Dicas Rápidas */}
          <h3
            style={{
              marginBottom: 8,
              fontFamily: `'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif`,
              fontWeight: 700,
              fontSize: 18,
              color: "#1976d2",
              letterSpacing: 0.2,
            }}
          >
            Dicas rápidas
          </h3>
          <ul style={{ marginBottom: 12 }}>
            <li>Use o feedback para eliminar opções.</li>
            <li>Não repita palpites já testados.</li>
            <li>Pense com lógica!</li>
          </ul>

          {/* 6. Streak */}
          <h3
            style={{
              marginBottom: 8,
              fontFamily: `'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif`,
              fontWeight: 700,
              fontSize: 18,
              color: "#1976d2",
              letterSpacing: 0.2,
            }}
          >
            Streak (Sequência de Vitórias)
          </h3>
          <ul style={{ marginBottom: 12 }}>
            <li>Jogue todo dia para manter sua sequência.</li>
            <li>Se pular um dia, ela zera.</li>
          </ul>

          {/* 7. Ações Especiais (Custom) */}
          <h3
            style={{
              marginBottom: 8,
              fontFamily: `'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif`,
              fontWeight: 700,
              fontSize: 18,
              color: "#1976d2",
              letterSpacing: 0.2,
            }}
          >
            Ações Especiais (Custom)
          </h3>
          <ul style={{ marginBottom: 12 }}>
            <li>
              <strong>Limpar Rodada:</strong> apaga palpites.
            </li>
            <li>
              <strong>Novo Jogo:</strong> novo código, zera histórico.
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
