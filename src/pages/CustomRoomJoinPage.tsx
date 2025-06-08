import React, { useCallback } from "react";
import CustomRoomEntry from "../components/CustomRoom/CustomRoomEntry";
import { useNavigate } from "react-router-dom";
import { useCustomRoom } from "../hooks/useCustomRoom";

// Página dedicada: só mostra a tela de entrada/lista, sem abas de criar
const CustomRoomJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { joinRoom } = useCustomRoom();

  // Função para entrar na sala pelo código
  const handleJoin = useCallback(
    async (roomId: string) => {
      let thisUserId = localStorage.getItem(`customRoomUserId_${roomId}`);
      const thisUserName =
        localStorage.getItem("customRoomUserName") || "Visitante Anônimo";
      if (!thisUserId) {
        thisUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem(`customRoomUserId_${roomId}`, thisUserId);
      }
      const joinResult = await joinRoom(roomId, {
        id: thisUserId,
        nome: thisUserName,
        terminouRodada: false,
        tentativas: [],
      });
      if (joinResult === "already_joined") {
        alert("Você já está participando desta sala.");
        return "already_joined";
      }
      if (joinResult === false) {
        alert("Erro ao entrar na sala. Tente novamente.");
        return false;
      }
      // Navega para o lobby da sala
      navigate(`/custom/lobby/${roomId}`);
      return true;
    },
    [navigate, joinRoom]
  );

  return (
    <CustomRoomEntry
      onCreate={() => {}}
      onJoin={handleJoin}
      creating={false}
      forceTab="entrar"
      hideTabs
    />
  );
};

export default CustomRoomJoinPage;
