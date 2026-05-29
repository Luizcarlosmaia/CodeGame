import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CustomRoomEntry from "./CustomRoomEntry";
import CustomRoomLobby from "./CustomRoomLobby";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import { markRoomAccessGranted } from "../../utils/customRoomAccess";
import { useAuth } from "../../contexts/AuthContext";
import {
  applyGuestResumeFromUrl,
  parseResumeSearchParams,
} from "../../utils/customRoomResume";

// Componente "flow" para alternar entre criar/entrar e o lobby
const CustomRoomFlow: React.FC = () => {
  const params = useParams<{ roomId?: string }>();
  const roomId = params.roomId ?? null;
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [resumeChecking, setResumeChecking] = useState(() => {
    if (!roomId) return false;
    const { memberId, token } = parseResumeSearchParams(location.search);
    return Boolean(memberId && token);
  });
  const [resumeError, setResumeError] = useState("");
  // const [creating, setCreating] = useState(false);
  // Persistência do userId no localStorage
  // Não usa mais userId global para salas permanentes
  const [userId, setUserId] = useState(() => {
    if (!roomId || typeof window === "undefined") return "";
    return localStorage.getItem(`customRoomUserId_${roomId}`) || "";
  });
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem("customRoomUserName");
    if (saved) return saved;
    localStorage.setItem("customRoomUserName", "Visitante");
    return "Visitante";
  });

  useEffect(() => {
    if (!roomId) return;

    const { memberId, token } = parseResumeSearchParams(location.search);
    if (memberId && token) {
      let cancelled = false;
      setResumeChecking(true);
      setResumeError("");

      void (async () => {
        try {
          const ok = await applyGuestResumeFromUrl(roomId, location.search);
          if (cancelled) return;

          if (!ok) {
            setResumeError(
            "Link inválido, já usado ou jogador não está mais na sala. Peça um novo link ou entre com o código."
          );
            return;
          }

          setUserId(memberId);
          setUserName(localStorage.getItem("customRoomUserName") || "Visitante");
          navigate(`/custom/lobby/${roomId}`, { replace: true });
        } finally {
          if (!cancelled) {
            setResumeChecking(false);
          }
        }
      })();

      return () => {
        cancelled = true;
        setResumeChecking(false);
      };
    }

    const storedUserId = localStorage.getItem(`customRoomUserId_${roomId}`) || "";
    setUserId(storedUserId);
    setUserName(localStorage.getItem("customRoomUserName") || "Visitante");
  }, [roomId, location.search, navigate]);

  const [creating] = useState(false);

  const handleCreate = async () => {
    window.location.href = "/login?redirect=/custom/criar";
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
      ...(authUser ? { accountId: authUser.id } : {}),
    });
    if (joinResult === "already_joined") {
      alert("Você já está participando desta sala.");
      return;
    }
    if (joinResult === false) {
      alert("Erro ao entrar na sala. Tente novamente.");
      return;
    }
    markRoomAccessGranted(id);
    // Navega para a URL do lobby da sala ao entrar
    window.location.href = `/custom/lobby/${id}`;
  };
  if (location.pathname === "/custom/criar") {
    return null;
  }

  if (roomId && resumeChecking) {
    return (
      <div className="custom-lobby-page">
        <div className="h-16" aria-hidden />
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <div className="custom-lobby-spinner" aria-hidden />
          <p className="mt-4 text-base font-semibold text-ink">Conectando ao seu jogador…</p>
        </div>
      </div>
    );
  }

  if (roomId && resumeError) {
    return (
      <div className="custom-lobby-page">
        <div className="h-16" aria-hidden />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-base font-semibold text-danger" role="alert">
            {resumeError}
          </p>
          <a href={`/custom/entrar?codigo=${encodeURIComponent(roomId)}`} className="btn-primary mt-6 inline-block">
            Entrar com código
          </a>
        </div>
      </div>
    );
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
