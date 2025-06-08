import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import CustomRoomEntry from "./CustomRoomEntry";
import { useLocation } from "react-router-dom";
import CustomRoomLobby from "./CustomRoomLobby";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import { generateRoomId } from "../../utils/generateRoomId";

// Componente "flow" para alternar entre criar/entrar e o lobby
const CustomRoomFlow: React.FC = () => {
  const params = useParams<{ roomId?: string }>();
  const roomId = params.roomId ?? null;
  // const [creating, setCreating] = useState(false);
  // Persistência do userId no localStorage
  // Não usa mais userId global para salas permanentes
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem("customRoomUserName");
    if (saved) return saved;
    localStorage.setItem("customRoomUserName", "Visitante");
    return "Visitante";
  });

  // Se acessar via URL direta, inicializa o fluxo para o lobby
  useEffect(() => {
    if (roomId) {
      // userId persistente por sala permanente
      let thisUserId = localStorage.getItem(`customRoomUserId_${roomId}`);
      if (!thisUserId) {
        thisUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem(`customRoomUserId_${roomId}`, thisUserId);
      }
      setUserId(thisUserId);
      // userName global
      const thisUserName =
        localStorage.getItem("customRoomUserName") || "Visitante";
      setUserName(thisUserName);
    }
  }, [roomId]);

  type EntryData = {
    nome: string;
    modos: { modo: string; rodadas: number }[];
    type: "permanente";
  };
  const [, setEntryData] = useState<EntryData | null>(null);
  const [creating, setCreating] = useState(false);

  // Criação real da sala no Firestore
  const { createRoom } = useCustomRoom();
  const handleCreate = async (data: EntryData) => {
    setCreating(true);
    // Gera um código aleatório de 10 caracteres (letras e números, sem prefixo "sala-")
    const newRoomId = generateRoomId();
    // Sempre gera e salva o userId específico da sala permanente
    const thisUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
    const thisUserName =
      localStorage.getItem("customRoomUserName") || userName || "Visitante";
    localStorage.setItem(`customRoomUserId_${newRoomId}`, thisUserId);
    setUserId(thisUserId); // Atualiza o estado ANTES de navegar
    // Aguarda o estado ser atualizado antes de prosseguir
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Gera as rodadas conforme os modos e quantidades escolhidas
    let rodadaIndex = 1;
    const rodadas = data.modos.flatMap(({ modo, rodadas }) =>
      Array.from({ length: rodadas }, () => ({
        rodada: rodadaIndex++,
        modo,
        codigo: "", // pode ser preenchido depois se quiser código fixo
        encerrada: false,
        inicio: "",
      }))
    );
    const customRoom = {
      id: newRoomId,
      nome: data.nome,
      type: "permanente" as const, // sempre permanente
      ownerId: thisUserId,
      admins: [thisUserId],
      membros: [
        {
          id: thisUserId,
          nome: thisUserName,
          terminouRodada: false,
          tentativas: [],
        },
      ],
      modo: data.modos[0]?.modo || "casual",
      rodadaAtual: 1,
      rodadas, // agora populado!
      modos: data.modos, // <-- garante que o campo modos é salvo
      ranking: [],
      aberta: true,
      criadaEm: new Date().toISOString(),
    };
    await createRoom(customRoom);
    // Polling para garantir que a sala foi criada no Firestore
    let tentativas = 0;
    const maxTentativas = 15; // ~3s
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    let found = false;
    while (tentativas < maxTentativas) {
      const ref = doc(db, "rooms", newRoomId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        found = true;
        break;
      }
      await delay(200);
      tentativas++;
    }
    if (found) {
      setEntryData({ ...data, type: "permanente" });
      // Espera mais 2 segundos para evitar "piscar" rápido
      await delay(2000);
      setCreating(false);
      window.location.href = `/custom/lobby/${newRoomId}`;
      return;
    }
    setCreating(false);
    alert(
      "Erro ao criar sala: não foi possível confirmar a criação. Tente novamente."
    );
    setCreating(false);
    alert(
      "Erro ao criar sala: não foi possível confirmar a criação. Tente novamente."
    );
  };
  // Ao entrar em sala existente
  const { joinRoom } = useCustomRoom();
  const handleJoin = async (id: string) => {
    // Só gera um novo userId se não existir para esta sala permanente
    let thisUserId = localStorage.getItem(`customRoomUserId_${id}`);
    const thisUserName =
      localStorage.getItem("customRoomUserName") || userName || "Visitante";
    if (!thisUserId) {
      thisUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(`customRoomUserId_${id}`, thisUserId);
    }
    setUserId(thisUserId);
    // Adiciona o membro imediatamente ao Firestore
    const joinResult = await joinRoom(id, {
      id: thisUserId,
      nome: thisUserName,
      terminouRodada: false,
      tentativas: [],
    });
    if (joinResult === "already_joined") {
      alert("Você já está participando desta sala.");
      return;
    }
    if (joinResult === false) {
      alert("Erro ao entrar na sala. Tente novamente.");
      return;
    }
    // Navega para a URL do lobby da sala ao entrar
    window.location.href = `/custom/lobby/${id}`;
  };
  const location = useLocation();
  // Se estiver na rota /custom/criar, não renderiza nada (deixa o AppContent cuidar)
  if (location.pathname === "/custom/criar") {
    return null;
  }
  if (!roomId) {
    // Mostra loading amigável durante a criação da sala
    return (
      <CustomRoomEntry
        key={location.search}
        onCreate={handleCreate}
        onJoin={handleJoin}
        creating={creating}
      />
    );
  }
  return (
    <CustomRoomLobby roomId={roomId} userId={userId} userName={userName} />
  );
};

export default CustomRoomFlow;
