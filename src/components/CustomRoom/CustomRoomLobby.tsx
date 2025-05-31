import React from "react";
import { useNavigate } from "react-router-dom";
import CustomRoomChat from "./CustomRoomChat";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import {
  LobbyContainer,
  RankingCard,
  BlockMargin,
  CenteredColumn,
  MainActionButton,
  ErrorMsg,
  StatusMsg,
  InfoMsg,
  LeaveButtonWrapper,
  LeaveButton,
} from "./CustomRoomLobby.styles";
import {
  RoomMainInfo,
  RoomConfigBlock,
  RoomMembersBlock,
  RoomRankingBlock,
} from "./CustomRoomLobbyBlocks";

// O ideal é receber o roomId da rota ou prop

interface CustomRoomLobbyProps {
  roomId: string;
  userId: string;
  userName: string;
  entryData?: {
    nome: string;
    modos: { modo: string; rodadas: number }[];
    type?: "permanente";
  } | null;
}

const CustomRoomLobby: React.FC<CustomRoomLobbyProps> = ({
  roomId,
  userId,
  userName,
  entryData,
}) => {
  const { room, loading, error, leaveRoom, joinRoom, deleteRoom } =
    useCustomRoom(roomId);
  const navigate = useNavigate();
  const [leaving, setLeaving] = React.useState(false);

  // Garante que o usuário está no array de membros ao acessar o lobby
  // Evita duplicidade: só chama joinRoom se o userId não está nos membros E não há outro membro com o mesmo nome
  React.useEffect(() => {
    if (room && userId && userName && Array.isArray(room.membros)) {
      const alreadyById = room.membros.some((m) => m.id === userId);
      const alreadyByName = room.membros.some(
        (m) => m.nome === userName && m.id !== userId
      );
      if (!alreadyById && !alreadyByName) {
        joinRoom(roomId, {
          id: userId,
          nome: userName,
          terminouRodada: false,
          tentativas: [],
          progresso: [],
        });
      }
    }
  }, [room, userId, userName, roomId, joinRoom]);

  // Redireciona automaticamente se a sala for fechada
  React.useEffect(() => {
    if (room && room.aberta === false) {
      alert("Esta sala foi fechada pelo dono ou está indisponível.");
      window.location.href = "/";
    }
  }, [room]);

  return (
    <LobbyContainer>
      {room && (
        <BlockMargin $mb={10}>
          <RoomMainInfo
            room={room}
            onCopyCode={() => {
              navigator.clipboard.writeText(room.id);
            }}
            onBack={() => navigate("/custom?tab=permanentes")}
            backDisabled={leaving}
          />
        </BlockMargin>
      )}

      {loading && <div>Carregando sala...</div>}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {!room && !loading && (
        <ErrorMsg>
          Sala não encontrada ou já foi fechada.
          <br />
          Verifique o código ou crie uma nova sala.
        </ErrorMsg>
      )}
      {room && (
        <>
          {/* Blocos principais do lobby */}
          <BlockMargin>
            <RoomConfigBlock entryData={entryData} room={room} />
          </BlockMargin>

          <BlockMargin>
            <RoomMembersBlock
              membros={room.membros}
              userId={userId}
              ownerId={room.ownerId}
            />
          </BlockMargin>

          <CenteredColumn>
            {room.membros.some((m) => m.id === userId) ? (
              <MainActionButton
                onClick={() => navigate(`/custom/game/${roomId}`)}
              >
                Jogar rodada
              </MainActionButton>
            ) : (
              <StatusMsg>Adicionando você como membro da sala...</StatusMsg>
            )}
            <InfoMsg>
              Você pode jogar as rodadas a qualquer momento do dia.
              <br />O código de cada rodada é resetado diariamente.
            </InfoMsg>
          </CenteredColumn>

          <RankingCard>
            <RoomRankingBlock
              ranking={room.ranking}
              membros={room.membros}
              userId={userId}
            />
          </RankingCard>

          <BlockMargin $mt={24}>
            <CustomRoomChat
              roomId={roomId}
              userId={userId}
              userName={userName}
            />
          </BlockMargin>

          {/* Abandonar sala no final da página */}
          <LeaveButtonWrapper>
            <LeaveButton
              onClick={async () => {
                if (
                  window.confirm(
                    room && room.ownerId === userId
                      ? "Você é o dono. Tem certeza que deseja EXCLUIR esta sala? Esta ação é irreversível."
                      : "Tem certeza que deseja abandonar esta sala? Você perderá o acesso direto, mas seu progresso será mantido caso volte pelo código."
                  )
                ) {
                  setLeaving(true);
                  if (room && room.ownerId === userId) {
                    await deleteRoom(roomId);
                  } else {
                    await leaveRoom(roomId, userId, true); // true = abandono
                  }
                  navigate("/custom?tab=permanentes");
                }
              }}
              disabled={leaving}
              $leaving={leaving}
            >
              {leaving
                ? room && room.ownerId === userId
                  ? "Excluindo..."
                  : "Abandonando..."
                : room && room.ownerId === userId
                ? "Excluir sala"
                : "Abandonar sala"}
            </LeaveButton>
          </LeaveButtonWrapper>
        </>
      )}
    </LobbyContainer>
  );
};

export default CustomRoomLobby;
