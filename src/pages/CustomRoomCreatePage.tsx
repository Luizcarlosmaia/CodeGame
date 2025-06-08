import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useCustomRoom } from "../hooks/useCustomRoom";
import {
  Label,
  Input,
  EntryLoadingBox,
  EntryErrorMsg,
} from "../components/CustomRoom/CustomRoomEntry.styles";
import PrimaryButton from "../components/PrimaryButton";
import { generateRoomId } from "../utils/generateRoomId";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  CreateRoomCard,
  ModeCounter,
  ModeIcon,
  ModeRowStyled,
  SelectFake,
} from "./CustomRoomCreatePage.styles";

const MODES = [
  { value: "casual", label: "Casual" },
  { value: "desafio", label: "Desafio" },
];

const CustomRoomCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [userName, setUserName] = useState<string>(
    typeof window !== "undefined" && window.localStorage
      ? localStorage.getItem("customRoomUserName") || ""
      : ""
  );
  const [selectedModes, setSelectedModes] = useState<{
    [modo: string]: number;
  }>({});
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [shakeInput, setShakeInput] = useState<string | null>(null);
  const { createRoom } = useCustomRoom();

  const handleModeChange = (modo: string, checked: boolean) => {
    setSelectedModes((prev) =>
      checked
        ? { ...prev, [modo]: 1 }
        : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== modo))
    );
  };

  const handleCreate = async () => {
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
      setCreating(true);
      localStorage.setItem("customRoomUserName", userName.trim());
      // Gera ID único e salva userId
      let newRoomId = "";
      let tentativas = 0;
      const maxTentativas = 10;
      while (tentativas < maxTentativas) {
        const candidate = generateRoomId();
        const ref = doc(db, "rooms", candidate);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          newRoomId = candidate;
          break;
        }
        tentativas++;
      }
      if (!newRoomId) {
        setError("Erro ao gerar código da sala. Tente novamente.");
        setCreating(false);
        return;
      }
      const thisUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(`customRoomUserId_${newRoomId}`, thisUserId);
      // Gera rodadas
      let rodadaIndex = 1;
      const rodadas = Object.entries(selectedModes).flatMap(([modo, rodadas]) =>
        Array.from({ length: rodadas }, () => ({
          rodada: rodadaIndex++,
          modo,
          codigo: "",
          encerrada: false,
          inicio: "",
        }))
      );
      const customRoom = {
        id: newRoomId,
        nome: nome.trim(),
        type: "permanente" as const,
        ownerId: thisUserId,
        admins: [thisUserId],
        membros: [
          {
            id: thisUserId,
            nome: userName.trim(),
            terminouRodada: false,
            tentativas: [],
          },
        ],
        modo: Object.keys(selectedModes)[0] || "casual",
        rodadaAtual: 1,
        rodadas,
        modos: Object.entries(selectedModes).map(([modo, rodadas]) => ({
          modo,
          rodadas,
        })),
        ranking: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
      };
      await createRoom(customRoom);
      setTimeout(() => {
        setCreating(false);
        navigate(`/custom/lobby/${newRoomId}`);
      }, 2000);
    }
    if (vibrate) {
      if (window.navigator.vibrate) window.navigator.vibrate(120);
      setTimeout(() => setShakeInput(null), 350);
    }
  };

  return (
    <CreateRoomCard>
      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <BackButton />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        autoComplete="off"
      >
        <Label htmlFor="custom-room-nome">Nome da Sala</Label>
        <Input
          id="custom-room-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value.slice(0, 20))}
          placeholder="Sala 1"
          maxLength={20}
          $shake={shakeInput === "nome" && !!error}
          style={{ marginBottom: 16 }}
        />

        <Label htmlFor="custom-room-user-name">Seu nome</Label>
        <Input
          id="custom-room-user-name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Digite seu nome"
          maxLength={24}
          $shake={shakeInput === "userName" && !!error}
          style={{ marginBottom: 16 }}
        />

        <Label htmlFor="custom-room-type">Tipo de Sala</Label>
        <SelectFake tabIndex={-1} aria-disabled="true">
          <span role="img" aria-label="Privada" style={{ marginRight: 8 }}>
            🔒
          </span>
          Privada
        </SelectFake>

        <Label style={{ marginTop: 16 }}>Modos:</Label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {MODES.map((m) => (
            <ModeRowStyled key={m.value}>
              <ModeIcon $mode={m.value}>
                {m.value === "casual" ? "😊" : "⚠️"}
              </ModeIcon>
              <span style={{ fontWeight: 600, fontSize: 17, flex: 1 }}>
                {m.value === "casual" ? "Modo Fácil" : "Modo Difícil"}
              </span>
              <ModeCounter>
                <button
                  type="button"
                  aria-label="Diminuir"
                  disabled={
                    selectedModes[m.value] === undefined ||
                    selectedModes[m.value] <= 1
                  }
                  onClick={() =>
                    setSelectedModes((prev) =>
                      prev[m.value] && prev[m.value] > 1
                        ? { ...prev, [m.value]: prev[m.value] - 1 }
                        : prev
                    )
                  }
                >
                  –
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={selectedModes[m.value] || ""}
                  onChange={(e) => {
                    const v = Math.max(1, Number(e.target.value));
                    setSelectedModes((prev) => ({ ...prev, [m.value]: v }));
                  }}
                  style={{ width: 36, textAlign: "center" }}
                  disabled={selectedModes[m.value] === undefined}
                />
                <button
                  type="button"
                  aria-label="Aumentar"
                  onClick={() =>
                    setSelectedModes((prev) => ({
                      ...prev,
                      [m.value]: prev[m.value] ? prev[m.value] + 1 : 1,
                    }))
                  }
                >
                  +
                </button>
              </ModeCounter>
              <input
                type="checkbox"
                checked={selectedModes[m.value] !== undefined}
                onChange={(e) => handleModeChange(m.value, e.target.checked)}
                style={{ marginLeft: 12 }}
              />
            </ModeRowStyled>
          ))}
        </div>
        <PrimaryButton type="submit" loading={creating} disabled={creating}>
          Criar Sala
        </PrimaryButton>
        {creating && (
          <EntryLoadingBox>
            Criando sala permanente...
            <br />
            Por favor, aguarde.
          </EntryLoadingBox>
        )}
        {error && (
          <EntryErrorMsg className="input-error-message">{error}</EntryErrorMsg>
        )}
      </form>
    </CreateRoomCard>
  );
};

export default CustomRoomCreatePage;
