import React from "react";
import {
  Section,
  Label,
  Input,
  ModeRow,
  Button,
} from "./CustomRoomEntry.styles";

const MODES = [
  { value: "casual", label: "Casual" },
  { value: "desafio", label: "Desafio" },
  // Adicione mais modos aqui futuramente
];

// Tab Criar Sala
export const TabCriar: React.FC<{
  nome: string;
  setNome: (v: string) => void;
  selectedModes: { [modo: string]: number };
  handleModeChange: (modo: string, checked: boolean) => void;
  handleRoundsChange: (modo: string, value: number) => void;
  canCreate: boolean;
  onCreate: () => void;
}> = ({
  nome,
  setNome,
  selectedModes,
  handleModeChange,
  handleRoundsChange,
  canCreate,
  onCreate,
}) => (
  <>
    <Section>
      <Label>Nome da sala</Label>
      <Input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: Sala dos Amigos"
        maxLength={32}
      />
    </Section>
    <Section>
      <Label>Modos e rodadas</Label>
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
              <input
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
                style={{ width: 60 }}
              />
            </>
          )}
        </ModeRow>
      ))}
    </Section>
    <Button disabled={!canCreate} onClick={onCreate}>
      Criar sala
    </Button>
  </>
);

// Tab Entrar
export const TabEntrar: React.FC<{
  joinId: string;
  setJoinId: (v: string) => void;
  onJoin: () => void;
}> = ({ joinId, setJoinId, onJoin }) => {
  const [shakeInput, setShakeInput] = React.useState(false);

  const handleJoin = () => {
    if (!joinId.trim()) {
      setShakeInput(true);
      if (window.navigator.vibrate) window.navigator.vibrate(120);
      setTimeout(() => setShakeInput(false), 350);
      return;
    }
    onJoin();
  };

  return (
    <Section>
      <Label>Código da sala temporária</Label>
      <Input
        value={joinId}
        onChange={(e) => setJoinId(e.target.value)}
        placeholder="Código da sala"
        maxLength={32}
        $shake={shakeInput}
      />
      <Button disabled={!joinId.trim()} onClick={handleJoin}>
        Entrar
      </Button>
    </Section>
  );
};

// Tab Permanentes
export const TabPermanentes: React.FC<{
  permanentRooms: {
    id: string;
    nome: string;
    modos?: { modo: string; rodadas: number }[];
  }[];
  loadingPermanent: boolean;
  onCopy: (id: string) => void;
}> = ({ permanentRooms, loadingPermanent, onCopy }) => (
  <Section>
    <Label>Minhas salas fixas</Label>
    <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
      Esta é a lista de salas fixas que você já participou. Para acessar
      qualquer sala, utilize o código correspondente.
    </div>
    {loadingPermanent && <div>Carregando...</div>}
    {!loadingPermanent && permanentRooms.length === 0 && (
      <div>Nenhuma sala fixa encontrada no seu histórico.</div>
    )}
    <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
      {permanentRooms.map((room) => (
        <li
          key={room.id}
          style={{
            marginBottom: 10,
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 10,
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <b>{room.nome}</b>{" "}
            <span style={{ color: "#1976d2", fontWeight: 500 }}>
              [{room.id}]
            </span>
            <div style={{ fontSize: 13, color: "#555" }}>
              Modos:{" "}
              {Array.isArray(room.modos) && room.modos.length > 0
                ? room.modos
                    .map(
                      (m: { modo: string; rodadas: number }) =>
                        `${m.modo} (${m.rodadas})`
                    )
                    .join(", ")
                : "-"}
            </div>
          </div>
          <button
            style={{
              margin: 0,
              padding: "6px 14px",
              fontSize: 14,
              background: "#eee",
              border: "1px solid #bbb",
              borderRadius: 6,
              cursor: "pointer",
            }}
            onClick={() => onCopy(room.id)}
            title="Copiar código da sala"
          >
            Copiar código
          </button>
        </li>
      ))}
    </ul>
  </Section>
);
