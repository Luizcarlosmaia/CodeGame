import React from "react";
import {
  ConfigEmpty,
  ConfigList,
  RoomCopyButton,
  RoomInfo,
  RoomMainCode,
  RoomMainCodeId,
  RoomMainDayCode,
  RoomMainHeader,
  RoomMainName,
  RoomMainSub,
} from "./CustomRoomLobby.styles";
import styled from "styled-components";
import type {
  CustomRoom,
  RoomPlayer,
  RoomRanking,
} from "../../types/customRoom";
import CustomRoomRanking from "./CustomRoomRanking";

export const RoomMainInfo: React.FC<{
  room: CustomRoom;
  onCopyCode?: () => void;
  onBack?: () => void;
  backDisabled?: boolean;
}> = ({ room, onCopyCode, onBack, backDisabled }) => (
  <RoomInfo style={{ marginBottom: 10 }}>
    <RoomMainHeader>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        {onBack && (
          <button
            onClick={onBack}
            disabled={backDisabled}
            style={{
              background: "#f1f5fa",
              color: "#1976d2",
              border: "none",
              borderRadius: 8,
              padding: "5px",
              fontSize: "0.70rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              opacity: backDisabled ? 0.6 : 1,
              minWidth: 0,
            }}
            tabIndex={0}
            aria-label="Voltar para lista"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: 2 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L8 10.5L12.5 6"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hide-on-mobile">Voltar para lista</span>
          </button>
        )}
      </div>
      <RoomMainCode
        style={{ flex: 1, justifyContent: "flex-end", display: "flex" }}
      >
        <span style={{ color: "#888", fontSize: 11 }}>Código:</span>
        <RoomMainCodeId>{room.id}</RoomMainCodeId>
        <RoomCopyButton onClick={onCopyCode} title="Copiar código">
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="6"
              y="6"
              width="9"
              height="9"
              rx="2"
              stroke="#1976d2"
              strokeWidth="1.5"
            />
            <rect
              x="3"
              y="3"
              width="9"
              height="9"
              rx="2"
              stroke="#1976d2"
              strokeWidth="1.5"
              fill="white"
            />
          </svg>
        </RoomCopyButton>
      </RoomMainCode>
    </RoomMainHeader>
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        margin: "6px 0 0 0",
      }}
    >
      <RoomMainName>{room.nome}</RoomMainName>
    </div>
    <RoomMainSub>
      Tipo: {room.type === "permanente" ? "Fixa" : "Temporária"} | Status:{" "}
      {room.aberta ? "Aberta" : "Fechada"}
    </RoomMainSub>
    {room.type === "permanente" && room.codigoDoDia && (
      <RoomMainDayCode>
        Código do dia: <b>{room.codigoDoDia}</b>
      </RoomMainDayCode>
    )}
  </RoomInfo>
);

// Bloco: Configurações

// Novo styled-component para cada item de configuração
const ConfigCard = styled.li`
  background: #f1f5fa;
  border: 1.5px solid #e3eaf5;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.07);
  padding: 10px 12px;
  margin-bottom: 8px;
  font-size: 1rem;
  color: #1976d2;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: box-shadow 0.18s;
  @media (max-width: 600px) {
    font-size: 0.65rem;
    padding: 0.1rem;
    border-radius: 77px;
    gap: 5px;
  }
`;

const ConfigIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  svg {
    width: 20px;
    height: 20px;
    color: #1976d2;
    opacity: 0.85;
  }
`;

export const RoomConfigBlock: React.FC<{
  entryData?: { modos: { modo: string; rodadas: number }[] } | null;
  room: CustomRoom;
}> = ({ entryData, room }) => (
  <RoomInfo>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
        justifyContent: "center",
        width: "100%",
      }}
    >
      <ConfigIcon>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.43-2.9c.04-.36.07-.73.07-1.1s-.03-.74-.07-1.1l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.23l-2.49 1a7.03 7.03 0 0 0-1.9-1.1l-.38-2.65A.5.5 0 0 0 13 2h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.03 7.03 0 0 0-1.9 1.1l-2.49-1a.5.5 0 0 0-.6.23l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.36-.07.73-.07 1.1s.03.74.07 1.1l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.23l2.49-1c.59.43 1.23.8 1.9 1.1l.38 2.65A.5.5 0 0 0 9 22h4a.5.5 0 0 0 .5-.42l.38-2.65a7.03 7.03 0 0 0 1.9-1.1l2.49 1a.5.5 0 0 0 .6-.23l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
            fill="currentColor"
          />
        </svg>
      </ConfigIcon>
      <b style={{ fontSize: 17, color: "#1976d2", fontWeight: 700 }}>
        Configurações
      </b>
    </div>
    <ConfigList>
      {entryData && entryData.modos && entryData.modos.length > 0 ? (
        entryData.modos.map((m) => (
          <ConfigCard key={m.modo}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: 6 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="3" width="14" height="14" rx="4" fill="#e3eaf5" />
              <rect
                x="6"
                y="6"
                width="8"
                height="8"
                rx="2"
                fill="#1976d2"
                fillOpacity="0.18"
              />
            </svg>
            {m.modo}{" "}
            <span
              style={{ color: "#388e3c", fontWeight: 500, margin: "0 4px" }}
            >
              •
            </span>{" "}
            {m.rodadas} rodada(s)
          </ConfigCard>
        ))
      ) : room.rodadas && room.rodadas.length > 0 ? (
        Object.entries(
          room.rodadas.reduce((acc: Record<string, number>, r) => {
            const modo =
              typeof r === "object" &&
              "modo" in r &&
              (r as { modo?: string }).modo
                ? (r as { modo: string }).modo
                : room.modo || "casual";
            acc[modo] = (acc[modo] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([modo, rodadas]) => (
          <ConfigCard key={modo}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: 6 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="3" width="14" height="14" rx="4" fill="#e3eaf5" />
              <rect
                x="6"
                y="6"
                width="8"
                height="8"
                rx="2"
                fill="#1976d2"
                fillOpacity="0.18"
              />
            </svg>
            {modo}{" "}
            <span
              style={{ color: "#388e3c", fontWeight: 500, margin: "0 4px" }}
            >
              •
            </span>{" "}
            {rodadas} rodada(s)
          </ConfigCard>
        ))
      ) : (
        <ConfigEmpty>Sem configurações.</ConfigEmpty>
      )}
    </ConfigList>
  </RoomInfo>
);

// Bloco: Membros
export const RoomMembersBlock: React.FC<{
  membros: RoomPlayer[];
  userId: string;
  ownerId: string;
}> = ({ membros, userId, ownerId }) => {
  // Remove duplicados por id
  const uniqueMembros = membros.filter(
    (m, idx, arr) => arr.findIndex((x) => x.id === m.id) === idx
  );
  const owner = uniqueMembros.find((m) => m.id === ownerId);
  const others = uniqueMembros.filter((m) => m.id !== ownerId);
  return (
    <RoomInfo>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {owner && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              color: "#1976d2",
              fontSize: 15,
              background: "#e3f2fd",
              borderRadius: 6,
              padding: "4px 10px",
              marginBottom: 2,
              maxWidth: 260,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: 2 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2L12.09 7.26L17.66 7.27L13.18 10.97L15.27 16.23L10 12.53L4.73 16.23L6.82 10.97L2.34 7.27L7.91 7.26L10 2Z"
                fill="#1976d2"
              />
            </svg>
            {owner.nome}{" "}
            <span style={{ fontWeight: 400, color: "#1976d2", fontSize: 13 }}>
              (Dono)
            </span>
            {owner.id === userId && (
              <span
                style={{
                  color: "#388e3c",
                  fontWeight: 500,
                  fontSize: 13,
                  marginLeft: 4,
                }}
              >
                (Você)
              </span>
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            maxHeight: 120,
            overflowY: others.length > 8 ? "auto" : "visible",
          }}
        >
          {others.map((m) => (
            <span
              key={m.id}
              style={{
                background: m.id === userId ? "#e0f7fa" : "#f5f5f5",
                color: m.id === userId ? "#00796b" : "#333",
                border:
                  m.id === userId ? "1.5px solid #00796b" : "1px solid #ddd",
                borderRadius: 6,
                padding: "4px 10px",
                fontWeight: m.id === userId ? 600 : 400,
                fontSize: 14,
                maxWidth: 180,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {m.nome}
              {m.id === userId && (
                <span
                  style={{
                    color: "#388e3c",
                    fontWeight: 500,
                    fontSize: 13,
                    marginLeft: 2,
                  }}
                >
                  (Você)
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </RoomInfo>
  );
};

// O ranking do lobby agora usa o componente visual bonito
export const RoomRankingBlock: React.FC<{
  ranking: RoomRanking[];
  membros: RoomPlayer[];
  userId: string;
}> = ({ ranking, membros, userId }) => (
  <CustomRoomRanking
    ranking={ranking}
    membros={membros}
    userId={userId}
    showStatus={false}
  />
);
