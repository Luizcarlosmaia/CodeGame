import React from "react";
import { useNavigate } from "react-router-dom";
import CustomRoomChat from "./CustomRoomChat";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import {
  LobbyContainer,
  MainActionButton,
  ErrorMsg,
  LobbyMainWrapper,
  LobbyLeftCol,
  LobbyRightCol,
  RoomCodeCard,
  RoomCode,
  RoomCodeCopyBtn,
  ParticipantsCard,
  ParticipantAvatar,
  ParticipantName,
  OwnerBadge,
  RoundsCard,
  RoundBadge,
} from "./CustomRoomLobby.styles";
import BackButton from "../BackButton";
import CustomRoomRanking from "./CustomRoomRanking";
import { RankingCard, RankingTitle } from "./CustomRoomGame.styles";

// O ideal é receber o roomId da rota ou prop

interface CustomRoomLobbyProps {
  roomId: string;
  userId: string;
  userName: string;
}

const CustomRoomLobby: React.FC<CustomRoomLobbyProps> = ({
  roomId,
  userId,
  userName,
}) => {
  const { room, loading, error, leaveRoom, deleteRoom } = useCustomRoom(roomId);
  const [leaving, setLeaving] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false); // novo controle
  const [permissaoVerificada, setPermissaoVerificada] = React.useState(false);
  const [temPermissao, setTemPermissao] = React.useState(false);
  const navigate = useNavigate();

  // Verifica permissão de acesso ao lobby
  React.useEffect(() => {
    if (isLeaving) return;
    if (room && userId && Array.isArray(room.membros)) {
      const alreadyById = room.membros.some((m) => m.id === userId);
      setPermissaoVerificada(true);
      setTemPermissao(alreadyById);
      if (!alreadyById) {
        alert(
          "Você não tem permissão para acessar esta sala. Entre pelo menu de entrada."
        );
        window.location.href = "/custom/entrar";
      }
    } else if (room && userId) {
      // Se a sala existe mas não tem membros, também bloqueia
      setPermissaoVerificada(true);
      setTemPermissao(false);
      alert(
        "Você não tem permissão para acessar esta sala. Entre pelo menu de entrada."
      );
      window.location.href = "/custom/entrar";
    }
  }, [room, userId, isLeaving]);

  // Redireciona automaticamente se a sala for fechada
  React.useEffect(() => {
    if (room && room.aberta === false) {
      alert("Esta sala foi fechada pelo dono ou está indisponível.");
      window.location.href = "/";
    }
  }, [room]);

  // Enquanto não verificou permissão, mostra apenas placeholder
  if (loading || !permissaoVerificada) {
    return (
      <LobbyContainer>
        <div style={{ padding: 32, textAlign: "center" }}>
          Verificando permissão...
        </div>
      </LobbyContainer>
    );
  }

  // Se não tem permissão, não renderiza nada do lobby (o efeito já redireciona)
  if (!temPermissao) {
    return null;
  }

  return (
    <LobbyContainer>
      <BackButton to={"/custom/entrar"} />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {!room && !loading && (
        <ErrorMsg>
          Sala não encontrada ou já foi fechada.
          <br />
          Verifique o código ou crie uma nova sala.
        </ErrorMsg>
      )}
      {room && (
        <LobbyMainWrapper>
          <LobbyLeftCol>
            <RoomCodeCard>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="14" fill="#e0e4ea" />
                  <circle cx="14" cy="12" r="6" fill="#b0b8c9" />
                  <ellipse cx="14" cy="22" rx="7" ry="4" fill="#b0b8c9" />
                </svg>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: "#fff" }}>
                    {room.nome}
                  </div>
                  <div
                    style={{ fontSize: 15, color: "#e0e4ea", fontWeight: 400 }}
                  >
                    Proprietário:{" "}
                    <span style={{ fontWeight: 600 }}>
                      {room.membros.find((m) => m.id === room.ownerId)?.nome ||
                        "---"}
                    </span>
                  </div>
                </div>
              </div>
              <RoomCode>
                <span style={{ fontWeight: 600, color: "#222", fontSize: 16 }}>
                  Código da sala
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 26, fontWeight: 700, letterSpacing: 2 }}
                  >
                    {room.id}
                  </span>
                  <RoomCodeCopyBtn
                    onClick={() => navigator.clipboard.writeText(room.id)}
                    title="Copiar código"
                  >
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                      <rect
                        x="7"
                        y="7"
                        width="10"
                        height="10"
                        rx="2"
                        stroke="#1976d2"
                        strokeWidth="1.5"
                        fill="#fff"
                      />
                      <rect
                        x="3"
                        y="3"
                        width="10"
                        height="10"
                        rx="2"
                        stroke="#1976d2"
                        strokeWidth="1.5"
                        fill="#fff"
                      />
                    </svg>
                  </RoomCodeCopyBtn>
                </div>
              </RoomCode>
            </RoomCodeCard>

            {/* Participantes */}
            <ParticipantsCard>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
                Participantes
              </div>
              {room.membros.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <ParticipantAvatar>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle cx="14" cy="14" r="14" fill="#e0e4ea" />
                      <circle cx="14" cy="12" r="6" fill="#b0b8c9" />
                      <ellipse cx="14" cy="22" rx="7" ry="4" fill="#b0b8c9" />
                    </svg>
                  </ParticipantAvatar>
                  <ParticipantName>{m.nome}</ParticipantName>
                  {m.id === room.ownerId && <OwnerBadge>★</OwnerBadge>}
                  {m.id === userId && (
                    <span
                      style={{
                        color: "#1976d2",
                        fontWeight: 500,
                        fontSize: 13,
                        marginLeft: 4,
                      }}
                    >
                      (Você)
                    </span>
                  )}
                </div>
              ))}
            </ParticipantsCard>

            {/* Rodadas */}
            <RoundsCard>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
                Rodadas
              </div>
              {Array.isArray(room.rodadas) && room.rodadas.length > 0 ? (
                Object.entries(
                  room.rodadas.reduce((acc: Record<string, number>, r) => {
                    const modo =
                      (r as { modo?: string }).modo || room.modo || "casual";
                    acc[modo] = (acc[modo] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([modo, rodadas]) => (
                  <RoundBadge key={modo} $mode={modo}>
                    <span style={{ marginRight: 6 }}>
                      {modo === "casual" ? "😊" : "😬"}
                    </span>
                    {modo === "casual" ? "Fácil" : "Difícil"} x{rodadas}
                  </RoundBadge>
                ))
              ) : (
                <span style={{ color: "#b0b8c9", fontWeight: 500 }}>-</span>
              )}
            </RoundsCard>

            <MainActionButton
              style={{ marginTop: 24 }}
              onClick={() => navigate(`/custom/game/${roomId}`)}
            >
              Iniciar Jogo
            </MainActionButton>
          </LobbyLeftCol>
          <LobbyRightCol>
            <RankingCard>
              <RankingTitle>Ranking</RankingTitle>
              <CustomRoomRanking
                ranking={room.ranking}
                membros={room.membros}
                userId={userId}
                totalRodadas={room.rodadas.length}
                showStatus={false}
              />
            </RankingCard>
            <CustomRoomChat
              roomId={roomId}
              userId={userId}
              userName={userName}
            />
          </LobbyRightCol>

          {/* Bloco inferior centralizado para Excluir/Abandonar sala */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: 32,
            }}
          >
            {room.ownerId === userId ? (
              <button
                style={{
                  background: "#fff",
                  color: "#d32f2f",
                  border: "1.5px solid #d32f2f",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: leaving ? "not-allowed" : "pointer",
                  minWidth: 140,
                  opacity: leaving ? 0.6 : 1,
                }}
                disabled={leaving}
                onClick={async () => {
                  if (leaving) return;
                  if (
                    !window.confirm(
                      "Tem certeza que deseja excluir a sala? Esta ação não pode ser desfeita."
                    )
                  )
                    return;
                  setLeaving(true);
                  setIsLeaving(true);
                  await deleteRoom(roomId);
                  setLeaving(false);
                  setIsLeaving(false);
                  navigate("/custom/entrar");
                }}
              >
                Excluir sala
              </button>
            ) : (
              <button
                style={{
                  background: "#fff",
                  color: "#d32f2f",
                  border: "1.5px solid #d32f2f",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: leaving ? "not-allowed" : "pointer",
                  minWidth: 140,
                  opacity: leaving ? 0.6 : 1,
                }}
                disabled={leaving}
                onClick={async () => {
                  if (leaving) return;
                  if (
                    !window.confirm("Tem certeza que deseja abandonar a sala?")
                  )
                    return;
                  setLeaving(true);
                  setIsLeaving(true);
                  await leaveRoom(roomId, userId, true);
                  setLeaving(false);
                  setIsLeaving(false);
                  navigate("/custom/entrar");
                }}
              >
                Abandonar sala
              </button>
            )}
          </div>
        </LobbyMainWrapper>
      )}
    </LobbyContainer>
  );
};

export default CustomRoomLobby;
