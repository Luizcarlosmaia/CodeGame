import React, { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Save, Settings2 } from "lucide-react";
import type { CustomRoom, RankingPeriodo } from "../../types/customRoom";
import { cn } from "../../lib/cn";
import {
  CUSTOM_ROOM_MODES,
  getModeLabel,
  type CustomRoomMode,
} from "../../utils/modeLabels";
import {
  formatRankingPeriodoDescription,
  formatRankingPeriodoLabel,
} from "../../utils/customRoomRankingPeriod";
import {
  normalizeRoomModos,
  type RoomModoConfig,
} from "../../utils/customRoomSettings";

type SettingsPatch = {
  nome?: string;
  modos?: RoomModoConfig[];
  rankingPeriodo?: RankingPeriodo;
};

interface CustomRoomLobbySettingsProps {
  room: CustomRoom;
  saving?: boolean;
  onSave: (patch: SettingsPatch) => Promise<boolean>;
}

function getModeIcon(modo: string): string {
  if (modo === "casual") return "🎨";
  if (modo === "codigo-mestre") return "🎯";
  return "🧮";
}

const MAX_RODADAS_POR_MODO = 20;

const CustomRoomLobbySettings: React.FC<CustomRoomLobbySettingsProps> = ({
  room,
  saving = false,
  onSave,
}) => {
  const [nome, setNome] = useState(room.nome);
  const [modos, setModos] = useState<RoomModoConfig[]>(() => normalizeRoomModos(room));
  const [rankingPeriodo, setRankingPeriodo] = useState<RankingPeriodo>(
    room.rankingPeriodo ?? "nunca"
  );
  const [localError, setLocalError] = useState("");
  const hasLocalEditsRef = useRef(false);

  useEffect(() => {
    hasLocalEditsRef.current = false;
  }, [room.id]);

  useEffect(() => {
    if (hasLocalEditsRef.current) return;

    setNome((prev) => (prev === room.nome ? prev : room.nome));
    setModos((prev) => {
      const next = normalizeRoomModos(room);
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
    setRankingPeriodo((prev) => {
      const next = room.rankingPeriodo ?? "nunca";
      return prev === next ? prev : next;
    });
  }, [room]);

  const totalRodadas = useMemo(
    () => modos.reduce((sum, entry) => sum + entry.rodadas, 0),
    [modos]
  );

  const nomeChanged = nome.trim() !== room.nome;
  const modosChanged = JSON.stringify(modos) !== JSON.stringify(normalizeRoomModos(room));
  const rankingChanged =
    room.type === "permanente" && rankingPeriodo !== (room.rankingPeriodo ?? "nunca");

  const getModoRodadas = (modo: string) =>
    modos.find((entry) => entry.modo === modo)?.rodadas ?? 0;

  const markModosDirty = () => {
    hasLocalEditsRef.current = true;
    setLocalError("");
  };

  const setModoRodadas = (modo: string, rodadas: number) => {
    markModosDirty();
    setModos((prev) => {
      const nextRodadas = Math.min(MAX_RODADAS_POR_MODO, Math.max(0, rodadas));

      if (nextRodadas === 0) {
        const next = prev.filter((entry) => entry.modo !== modo);
        if (next.reduce((sum, entry) => sum + entry.rodadas, 0) === 0) {
          setLocalError("Precisa restar pelo menos uma rodada na sala.");
          return prev;
        }
        return next;
      }

      const existing = prev.find((entry) => entry.modo === modo);
      if (existing) {
        return prev.map((entry) =>
          entry.modo === modo ? { ...entry, rodadas: nextRodadas } : entry
        );
      }

      return [...prev, { modo, rodadas: nextRodadas }];
    });
  };

  const increaseModo = (modo: string) => {
    setModoRodadas(modo, getModoRodadas(modo) + 1);
  };

  const decreaseModo = (modo: string) => {
    setModoRodadas(modo, getModoRodadas(modo) - 1);
  };

  const addModo = (modo: CustomRoomMode) => {
    setModoRodadas(modo, 1);
  };

  const savePatch = async (patch: SettingsPatch) => {
    setLocalError("");
    const success = await onSave(patch);
    if (success) {
      hasLocalEditsRef.current = false;
    } else {
      setLocalError("Não foi possível salvar. Tente novamente.");
    }
  };

  return (
    <section className="custom-create-section">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Settings2 size={20} aria-hidden />
        </span>
        <div>
          <h2 className="custom-create-section-title">Configurações da sala</h2>
          <p className="custom-create-section-subtitle">
            Somente o anfitrião pode alterar nome, modos e reset do ranking.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="lobby-room-name" className="input-label">
            Nome da sala
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              id="lobby-room-name"
              value={nome}
              maxLength={20}
              disabled={saving}
              onChange={(e) => {
                hasLocalEditsRef.current = true;
                setNome(e.target.value.slice(0, 20));
                setLocalError("");
              }}
              className="input-field flex-1"
            />
            <button
              type="button"
              disabled={saving || !nomeChanged || !nome.trim()}
              onClick={() => savePatch({ nome: nome.trim() })}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand disabled:opacity-50"
            >
              <Save size={16} aria-hidden />
              Salvar nome
            </button>
          </div>
        </div>

        <div>
          <p className="input-label">Modos e rodadas</p>
          <p className="mt-1 text-xs text-ink-muted">
            Adicione ou remova modos e ajuste quantas rodadas de cada. Pontos já
            conquistados permanecem no ranking.
          </p>
          <ul className="mt-3 space-y-2">
            {CUSTOM_ROOM_MODES.map((modo) => {
              const rodadas = getModoRodadas(modo);
              const isActive = rodadas > 0;

              return (
                <li
                  key={modo}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                    isActive
                      ? "border-border/60 bg-background"
                      : "border-dashed border-border/50 bg-background/60"
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span aria-hidden>{getModeIcon(modo)}</span>
                    {getModeLabel(modo)}
                    {isActive && (
                      <span className="text-ink-muted">×{rodadas}</span>
                    )}
                  </span>

                  {isActive ? (
                    <div className="custom-create-stepper">
                      <button
                        type="button"
                        aria-label={`Diminuir rodadas de ${getModeLabel(modo)}`}
                        disabled={saving || (totalRodadas <= 1 && rodadas <= 1)}
                        className="custom-create-stepper-btn"
                        onClick={() => decreaseModo(modo)}
                      >
                        <Minus size={14} aria-hidden />
                      </button>
                      <span className="custom-create-stepper-value">{rodadas}</span>
                      <button
                        type="button"
                        aria-label={`Aumentar rodadas de ${getModeLabel(modo)}`}
                        disabled={saving || rodadas >= MAX_RODADAS_POR_MODO}
                        className="custom-create-stepper-btn"
                        onClick={() => increaseModo(modo)}
                      >
                        <Plus size={14} aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => addModo(modo)}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/5 px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:border-brand/50 disabled:opacity-40"
                    >
                      <Plus size={14} aria-hidden />
                      Adicionar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {modosChanged && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-brand">
                Alterações nos modos ainda não salvas.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={() => savePatch({ modos })}
                className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand disabled:opacity-50"
              >
                <Save size={16} aria-hidden />
                Salvar modos ({totalRodadas} rodadas)
              </button>
            </div>
          )}
        </div>

        {room.type === "permanente" && (
          <div>
            <label htmlFor="lobby-ranking-period" className="input-label">
              Reset do ranking
            </label>
            <p className="mt-1 text-xs text-ink-muted">
              {formatRankingPeriodoDescription(rankingPeriodo)}
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <select
                id="lobby-ranking-period"
                value={rankingPeriodo}
                disabled={saving}
                onChange={(e) => {
                  hasLocalEditsRef.current = true;
                  setRankingPeriodo(e.target.value as RankingPeriodo);
                  setLocalError("");
                }}
                className="input-field flex-1"
              >
                <option value="nunca">Contínuo — sem reset</option>
                <option value="semanal">Semanal — toda segunda</option>
                <option value="mensal">Mensal — dia 1</option>
              </select>
              <button
                type="button"
                disabled={saving || !rankingChanged}
                onClick={() => savePatch({ rankingPeriodo })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand disabled:opacity-50"
              >
                <Save size={16} aria-hidden />
                Salvar ranking
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-ink">
              Atual: {formatRankingPeriodoLabel(room.rankingPeriodo ?? "nunca")}
            </p>
          </div>
        )}
      </div>

      {localError && (
        <p className={cn("mt-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger")} role="alert">
          {localError}
        </p>
      )}
    </section>
  );
};

export default CustomRoomLobbySettings;
