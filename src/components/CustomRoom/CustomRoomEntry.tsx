import React, { useState, useEffect } from "react";
// Removido import duplicado de useLocation/Navigate
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  EntryContainer,
  Section,
  Label,
  Input,
  EntryPermanentList,
  EntryPermanentBtn,
  EntryPermanentItem,
  EntryPermanentModos,
  EntryPermanentId,
  EntryErrorMsg,
  EntryModoBadge,
  EntryMainWrapper,
  EntryFormCol,
  EntryListCol,
} from "./CustomRoomEntry.styles";
import PrimaryButton from "../PrimaryButton";
import BackButton from "../BackButton";
interface Props {
  onCreate: (data: {
    nome: string;
    modos: { modo: string; rodadas: number }[];
    type: "permanente";
  }) => void;
  onJoin: (roomId: string) => Promise<"already_joined" | false | true | void>;
  forceTab?: "criar" | "entrar" | "permanentes";
  hideTabs?: boolean;
}

import { useLocation, useNavigate } from "react-router-dom";

const CustomRoomEntry: React.FC<Props & { creating?: boolean }> = ({
  onJoin,
  forceTab,
  hideTabs,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab sempre derivada da query string, exceto se forçado
  function getTabFromQuery() {
    if (forceTab) return forceTab;
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "permanentes") return "permanentes";
    if (tabParam === "entrar") return "entrar";
    return "criar";
  }
  const tab = getTabFromQuery();

  const [, setNome] = useState("");
  const [userName, setUserName] = useState(
    () => localStorage.getItem("customRoomUserName") || ""
  );
  const [, setSelectedModes] = useState<{
    [modo: string]: number;
  }>({});
  const [joinId, setJoinId] = useState("");
  type PermanentRoom = {
    id: string;
    nome: string;
    modos?: { modo: string; rodadas: number }[];
  };
  const [permanentRooms, setPermanentRooms] = useState<PermanentRoom[]>([]);
  const [loadingPermanent, setLoadingPermanent] = useState(false);
  const [error, setError] = useState<string>("");
  const [shakeInput, setShakeInput] = useState<string | null>(null);
  const joinInputRef = React.useRef<HTMLInputElement>(null);

  // Limpa campos ao trocar de aba
  useEffect(() => {
    setNome("");
    setSelectedModes({});
    setJoinId("");
    setError("");
  }, [tab]);

  // Carrega salas permanentes tanto na aba "permanentes" quanto na tela de entrada dedicada
  useEffect(() => {
    if (tab === "permanentes" || (tab === "entrar" && hideTabs)) {
      setLoadingPermanent(true);
      const fetchRooms = async () => {
        const q = query(
          collection(db, "rooms"),
          where("type", "==", "permanente")
        );
        const snap = await getDocs(q);
        // Filtra apenas salas abertas onde o userId (específico da sala) está em membros
        const filtered = snap.docs
          .map((d) => ({
            id: d.id,
            nome: (d.data().nome as string) || "",
            modos: d.data().modos || [],
            aberta: d.data().aberta,
            membros: d.data().membros || [],
          }))
          .filter((room) => {
            const userId = localStorage.getItem(`customRoomUserId_${room.id}`);
            return (
              room.aberta !== false &&
              Array.isArray(room.membros) &&
              !!userId &&
              room.membros.some((m) => m.id === userId)
            );
          });
        setPermanentRooms(filtered);
        setLoadingPermanent(false);
      };
      fetchRooms();
    }
  }, [tab, hideTabs]);

  useEffect(() => {
    if (tab === "entrar" && joinInputRef.current) {
      joinInputRef.current.focus();
    }
    setError(""); // Limpa erro ao trocar de aba
  }, [tab]);

  return (
    <EntryContainer>
      <EntryMainWrapper>
        <EntryFormCol>
          <div style={{ marginTop: 16, marginBottom: 8 }}>
            <BackButton to="/home" />
          </div>
          <Section
            style={{
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.07)",
              padding: 24,
            }}
          >
            <Label>
              Código da sala <span style={{ color: "#d32f2f" }}>*</span>
            </Label>
            <Input
              ref={joinInputRef}
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Código da sala"
              maxLength={32}
              $shake={shakeInput === "joinId" && !!error}
            />
            <Label style={{ marginTop: 12 }}>
              Seu nome <span style={{ color: "#d32f2f" }}>*</span>
            </Label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={24}
              $shake={shakeInput === "userName" && !!error}
            />
            <PrimaryButton
              style={{ width: "100%", marginTop: 12 }}
              onClick={async () => {
                let vibrate = false;
                if (!userName.trim()) {
                  setError("Digite seu nome.");
                  setShakeInput("userName");
                  vibrate = true;
                } else if (!joinId.trim()) {
                  setError("Digite o código da sala.");
                  setShakeInput("joinId");
                  vibrate = true;
                } else {
                  setError("");
                  setShakeInput(null);
                  localStorage.setItem("customRoomUserName", userName.trim());
                  // onJoin agora pode retornar erro
                  const joinResult = await onJoin(joinId.trim());
                  if (joinResult === "already_joined") {
                    setError("Você já está participando desta sala.");
                    setShakeInput("joinId");
                    vibrate = true;
                    return;
                  }
                  if (joinResult === false) {
                    setError("Erro ao entrar na sala. Tente novamente.");
                    setShakeInput("joinId");
                    vibrate = true;
                    return;
                  }
                }
                if (vibrate) {
                  if (window.navigator.vibrate) window.navigator.vibrate(120);
                  setTimeout(() => setShakeInput(null), 350);
                }
              }}
            >
              Entrar
            </PrimaryButton>
            {error && (
              <EntryErrorMsg className="input-error-message">
                {error}
              </EntryErrorMsg>
            )}
          </Section>
        </EntryFormCol>
        <EntryListCol>
          <Section>
            <Label>Salas que já sou membro:</Label>
            {loadingPermanent && <div>Carregando...</div>}
            {!loadingPermanent && permanentRooms.length === 0 && (
              <div>Nenhuma sala permanente disponível.</div>
            )}
            <EntryPermanentList>
              {permanentRooms.map((room) => (
                <EntryPermanentItem key={room.id}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <b>{room.nome}</b>
                      <EntryPermanentId>[{room.id}]</EntryPermanentId>
                    </div>
                    <EntryPermanentModos>
                      {Array.isArray(room.modos) && room.modos.length > 0 ? (
                        room.modos.map(
                          (m: { modo: string; rodadas: number }) => (
                            <EntryModoBadge key={m.modo}>
                              {m.modo.charAt(0).toUpperCase() + m.modo.slice(1)}{" "}
                              · {m.rodadas} rodada{m.rodadas === 1 ? "" : "s"}
                            </EntryModoBadge>
                          )
                        )
                      ) : (
                        <span style={{ color: "#b0b8c9", fontWeight: 500 }}>
                          -
                        </span>
                      )}
                    </EntryPermanentModos>
                  </div>
                  <EntryPermanentBtn
                    onClick={() => navigate(`/custom/lobby/${room.id}`)}
                  >
                    Entrar
                  </EntryPermanentBtn>
                </EntryPermanentItem>
              ))}
            </EntryPermanentList>
          </Section>
        </EntryListCol>
      </EntryMainWrapper>
    </EntryContainer>
  );
};

export default CustomRoomEntry;
