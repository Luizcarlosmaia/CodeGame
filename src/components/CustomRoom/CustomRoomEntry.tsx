import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  EntryContainer,
  Section,
  Label,
  Input,
  ModeRow,
  Button,
  EntryTabs,
  EntryTab,
  EntryPermanentList,
  EntryPermanentBtn,
  EntryPermanentItem,
  EntryPermanentModos,
  EntryPermanentId,
  FieldsRow,
  EntryLoadingBox,
  EntryTypeLabel,
  EntryErrorMsg,
} from "./CustomRoomEntry.styles";
import { ModeInput } from "./CustomRoomEntryExtra.styles";

const MODES = [
  { value: "casual", label: "Casual" },
  { value: "desafio", label: "Desafio" },
  // Adicione mais modos aqui futuramente
];

interface Props {
  onCreate: (data: {
    nome: string;
    modos: { modo: string; rodadas: number }[];
    type: "permanente";
  }) => void;
  onJoin: (roomId: string) => void;
}

import { useLocation, useNavigate } from "react-router-dom";

const CustomRoomEntry: React.FC<Props & { creating?: boolean }> = ({
  onCreate,
  onJoin,
  creating,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Tab sempre derivada da query string
  function getTabFromQuery() {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "permanentes") return "permanentes";
    if (tabParam === "entrar") return "entrar";
    return "criar";
  }
  const tab = getTabFromQuery();
  const [nome, setNome] = useState("");
  const [userName, setUserName] = useState(
    () => localStorage.getItem("customRoomUserName") || ""
  );
  const [selectedModes, setSelectedModes] = useState<{
    [modo: string]: number;
  }>({});
  const [joinId, setJoinId] = useState("");
  // Não há mais seleção de tipo de sala, sempre "permanente"

  // Limpa campos ao trocar de aba
  useEffect(() => {
    setNome("");
    setSelectedModes({});
    setJoinId("");
    setError("");
  }, [tab]);
  type PermanentRoom = {
    id: string;
    nome: string;
    modos?: { modo: string; rodadas: number }[];
  };
  const [permanentRooms, setPermanentRooms] = useState<PermanentRoom[]>([]);
  const [loadingPermanent, setLoadingPermanent] = useState(false);
  const [error, setError] = useState<string>("");
  // shakeInput: 'nome' | 'userName' | 'modes' | 'joinId' | null
  const [shakeInput, setShakeInput] = useState<string | null>(null);
  const joinInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === "permanentes") {
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
  }, [tab]);

  const handleModeChange = (modo: string, checked: boolean) => {
    setSelectedModes((prev) =>
      checked
        ? { ...prev, [modo]: 1 }
        : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== modo))
    );
  };

  const handleRoundsChange = (modo: string, value: number) => {
    setSelectedModes((prev) => ({ ...prev, [modo]: value }));
  };

  // const canCreate =
  //   nome.trim() &&
  //   Object.keys(selectedModes).length > 0 &&
  //   Object.values(selectedModes).every((v) => v > 0);

  // Foco automático no input de código ao trocar para aba "entrar"
  useEffect(() => {
    if (tab === "entrar" && joinInputRef.current) {
      joinInputRef.current.focus();
    }
    setError(""); // Limpa erro ao trocar de aba
  }, [tab]);

  return (
    <EntryContainer>
      <EntryTabs>
        <EntryTab
          $active={tab === "criar"}
          type="button"
          onClick={() => {
            if (tab !== "criar") navigate("/custom?tab=criar");
            else navigate("/custom?tab=criar", { replace: true });
          }}
        >
          Criar sala
        </EntryTab>
        <EntryTab
          $active={tab === "entrar"}
          type="button"
          onClick={() => {
            if (tab !== "entrar") navigate("/custom?tab=entrar");
            else navigate("/custom?tab=entrar", { replace: true });
          }}
        >
          Entrar
        </EntryTab>
        <EntryTab
          $active={tab === "permanentes"}
          type="button"
          onClick={() => {
            if (tab !== "permanentes") navigate("/custom?tab=permanentes");
            else navigate("/custom?tab=permanentes", { replace: true });
          }}
        >
          Salas fixas
        </EntryTab>
      </EntryTabs>

      {tab === "criar" && (
        <>
          {creating && (
            <EntryLoadingBox>
              Criando sala permanente...
              <br />
              Por favor, aguarde.
            </EntryLoadingBox>
          )}
          <Section>
            <FieldsRow>
              <div style={{ flex: 2, minWidth: 0 }}>
                <Label htmlFor="custom-room-nome">
                  Nome da sala <span style={{ color: "#d32f2f" }}>*</span>
                </Label>
                <Input
                  id="custom-room-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value.slice(0, 20))}
                  placeholder="Ex: Sala dos Amigos"
                  maxLength={20}
                  $shake={shakeInput === "nome" && !!error}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Label>Tipo de sala</Label>
                <EntryTypeLabel>Sala Fixa</EntryTypeLabel>
              </div>
            </FieldsRow>
            <FieldsRow>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Label htmlFor="custom-room-user-name">
                  Seu nome <span style={{ color: "#d32f2f" }}>*</span>
                </Label>
                <Input
                  id="custom-room-user-name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Digite seu nome"
                  maxLength={10}
                  $shake={shakeInput === "userName" && !!error}
                />
              </div>
            </FieldsRow>
          </Section>
          <Section>
            <Label>
              Modos e rodadas <span style={{ color: "#d32f2f" }}>*</span>
            </Label>
            {MODES.map((m) => (
              <ModeRow key={m.value}>
                <input
                  type="checkbox"
                  checked={selectedModes[m.value] !== undefined}
                  onChange={(e) => handleModeChange(m.value, e.target.checked)}
                  id={`mode-${m.value}`}
                />
                <label htmlFor={`mode-${m.value}`}>{m.label}</label>
                {selectedModes[m.value] !== undefined && (
                  <>
                    <span>Rodadas:</span>
                    <ModeInput
                      type="number"
                      min={1}
                      max={20}
                      value={selectedModes[m.value]}
                      onChange={(e) =>
                        handleRoundsChange(
                          m.value,
                          Math.max(1, Number(e.target.value))
                        )
                      }
                    />
                  </>
                )}
              </ModeRow>
            ))}
          </Section>
          <Button
            onClick={() => {
              if (creating) return;
              let vibrate = false;
              if (!nome.trim()) {
                setError("Digite um nome para a sala.");
                setShakeInput("nome");
                vibrate = true;
              } else if (!userName.trim()) {
                setError("Digite seu nome.");
                setShakeInput("userName");
                vibrate = true;
              } else if (Object.keys(selectedModes).length === 0) {
                setError("Selecione pelo menos um modo e defina as rodadas.");
                setShakeInput("modes");
                vibrate = true;
              } else if (!Object.values(selectedModes).every((v) => v > 0)) {
                setError("O número de rodadas deve ser maior que zero.");
                setShakeInput("modes");
                vibrate = true;
              } else {
                setError("");
                setShakeInput(null);
                localStorage.setItem("customRoomUserName", userName.trim());
                onCreate({
                  nome: nome.trim(),
                  modos: Object.entries(selectedModes).map(
                    ([modo, rodadas]) => ({
                      modo,
                      rodadas,
                    })
                  ),
                  type: "permanente",
                });
              }
              if (vibrate) {
                if (window.navigator.vibrate) window.navigator.vibrate(120);
                setTimeout(() => setShakeInput(null), 350);
              }
            }}
            disabled={creating}
            style={creating ? { opacity: 0.6, pointerEvents: "none" } : {}}
          >
            Criar sala
          </Button>
          {error && (
            <EntryErrorMsg className="input-error-message">
              {error}
            </EntryErrorMsg>
          )}
        </>
      )}

      {tab === "entrar" && (
        <Section>
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
          <Button
            onClick={() => {
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
                onJoin(joinId.trim());
              }
              if (vibrate) {
                if (window.navigator.vibrate) window.navigator.vibrate(120);
                setTimeout(() => setShakeInput(null), 350);
              }
            }}
          >
            Entrar
          </Button>
        </Section>
      )}

      {tab === "permanentes" && (
        <Section>
          <Label>Salas permanentes</Label>
          {loadingPermanent && <div>Carregando...</div>}
          {!loadingPermanent && permanentRooms.length === 0 && (
            <div>Nenhuma sala permanente disponível.</div>
          )}
          <EntryPermanentList>
            {permanentRooms.map((room) => (
              <EntryPermanentItem key={room.id}>
                <div>
                  <b>{room.nome}</b>{" "}
                  <EntryPermanentId>[{room.id}]</EntryPermanentId>
                  <EntryPermanentModos>
                    Modos:{" "}
                    {Array.isArray(room.modos) && room.modos.length > 0
                      ? room.modos
                          .map(
                            (m: { modo: string; rodadas: number }) =>
                              `${m.modo} (${m.rodadas})`
                          )
                          .join(", ")
                      : "-"}
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
      )}
    </EntryContainer>
  );
};

export default CustomRoomEntry;
