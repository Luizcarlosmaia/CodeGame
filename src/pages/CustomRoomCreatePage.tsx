import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { FormField, fieldInputClass } from "../components/FormField";
import { useCustomRoom } from "../hooks/useCustomRoom";
import { generateRoomId } from "../utils/generateRoomId";
import { roomsApi } from "../api/roomsApi";
import { cn } from "../lib/cn";
import { getModeLabel, MODE_DISPLAY, getModeMaxTries } from "../utils/modeLabels";
import type { CustomRoomMode } from "../utils/modeLabels";
import type { RoomType, RankingPeriodo } from "../types/customRoom";
import { getTemporaryRoomExpiresAt } from "../utils/customRoomLifecycle";
import { markRoomAccessGranted } from "../utils/customRoomAccess";
import {
  formatRankingPeriodoLabel,
  getNextRankingResetAt,
} from "../utils/customRoomRankingPeriod";

const MODE_OPTIONS: Array<{
  value: CustomRoomMode;
  icon: string;
  accent: string;
  badgeClass: string;
}> = [
  {
    value: "casual",
    icon: "🎨",
    accent: "border-success/30 bg-success/5 hover:border-success/40",
    badgeClass: "bg-success/10 text-success",
  },
  {
    value: "desafio",
    icon: "🧮",
    accent: "border-brand/30 bg-brand/5 hover:border-brand/40",
    badgeClass: "bg-brand/10 text-brand",
  },
  {
    value: "codigo-mestre",
    icon: "🎯",
    accent: "border-accent/30 bg-accent/5 hover:border-accent/40",
    badgeClass: "bg-accent/10 text-accent",
  },
];

const CustomRoomCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [userName, setUserName] = useState<string>(
    typeof window !== "undefined" && window.localStorage
      ? localStorage.getItem("customRoomUserName") || ""
      : ""
  );
  const [selectedModes, setSelectedModes] = useState<Record<string, number>>(
    {}
  );
  const [creating, setCreating] = useState(false);
  const [roomType, setRoomType] = useState<RoomType>("permanente");
  const [rankingPeriodo, setRankingPeriodo] = useState<RankingPeriodo>("nunca");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    userName?: string;
    nome?: string;
    modes?: string;
  }>({});
  const { createRoom } = useCustomRoom();

  const totalRodadas = useMemo(
    () => Object.values(selectedModes).reduce((sum, count) => sum + count, 0),
    [selectedModes]
  );

  const selectedModeEntries = useMemo(
    () =>
      Object.entries(selectedModes).map(([modo, rodadas]) => ({
        modo: modo as CustomRoomMode,
        rodadas,
        label: getModeLabel(modo),
      })),
    [selectedModes]
  );

  const canSubmit = !creating;

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setError("");
  };

  const validateForm = () => {
    const nextErrors: typeof fieldErrors = {};

    if (!userName.trim()) {
      nextErrors.userName = "Digite seu nome para entrar na sala.";
    }
    if (!nome.trim()) {
      nextErrors.nome = "Digite um nome para a sala.";
    }
    if (totalRodadas === 0) {
      nextErrors.modes = "Selecione pelo menos um modo de jogo.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstMessage =
        nextErrors.userName ?? nextErrors.nome ?? nextErrors.modes ?? "";
      setError(firstMessage);
      if (window.navigator.vibrate) window.navigator.vibrate(120);
      return false;
    }

    setError("");
    return true;
  };

  const toggleMode = (modo: CustomRoomMode) => {
    setSelectedModes((prev) => {
      if (prev[modo] !== undefined) {
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== modo)
        );
      }
      return { ...prev, [modo]: 1 };
    });
    clearFieldError("modes");
  };

  const updateModeRounds = (modo: CustomRoomMode, rodadas: number) => {
    setSelectedModes((prev) => ({
      ...prev,
      [modo]: Math.min(20, Math.max(1, rodadas)),
    }));
    clearFieldError("modes");
  };

  const handleCreate = async () => {
    if (creating || !validateForm()) return;

    setCreating(true);
    localStorage.setItem("customRoomUserName", userName.trim());

    try {
      let newRoomId = "";
      for (let tentativas = 0; tentativas < 10; tentativas++) {
        const candidate = generateRoomId();
        const exists = await roomsApi.roomExists(candidate);
        if (!exists) {
          newRoomId = candidate;
          break;
        }
      }

      if (!newRoomId) {
        setError("Não foi possível gerar o código da sala. Tente novamente.");
        return;
      }

      const thisUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(`customRoomUserId_${newRoomId}`, thisUserId);

      let rodadaIndex = 1;
      const rodadas = Object.entries(selectedModes).flatMap(
        ([modo, rodadasCount]) =>
          Array.from({ length: rodadasCount }, () => ({
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
        type: roomType,
        ownerId: thisUserId,
        admins: [thisUserId],
        membros: [
          {
            id: thisUserId,
            nome: userName.trim(),
            terminouRodada: false,
            tentativas: [],
            progresso: [],
          },
        ],
        modo: Object.keys(selectedModes)[0] || "casual",
        rodadaAtual: 1,
        rodadas,
        modos: Object.entries(selectedModes).map(([modo, rodadasCount]) => ({
          modo,
          rodadas: rodadasCount,
        })),
        ranking: [],
        aberta: true,
        criadaEm: new Date().toISOString(),
        ...(roomType === "temporaria"
          ? { expiraEm: getTemporaryRoomExpiresAt(), partidaNumero: 1 }
          : {
              rankingPeriodo,
              ...(rankingPeriodo !== "nunca"
                ? { rankingResetEm: getNextRankingResetAt(rankingPeriodo) }
                : {}),
            }),
      };

      await createRoom(customRoom);
      markRoomAccessGranted(newRoomId);
      navigate(`/custom/lobby/${newRoomId}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao criar a sala. Verifique sua conexão e tente de novo.";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="custom-create-page">
      <div className="h-16" aria-hidden />

      <main className="relative overflow-hidden pb-12">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -right-24 top-0 size-[420px] rounded-full bg-brand/6 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-[360px] rounded-full bg-success/6 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <BackButton to="/home" className="mb-4" />

          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-brand">
              Multiplayer
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Criar sala personalizada
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              Monte uma partida privada com amigos, escolha os modos e quantas
              rodadas de cada um.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              autoComplete="off"
              className="flex flex-col gap-5"
            >
              <section className="custom-create-section">
                <h2 className="custom-create-section-title">Quem é você</h2>
                <p className="custom-create-section-subtitle">
                  Esse nome aparece para os outros jogadores na sala.
                </p>

                <FormField
                  id="custom-room-user-name"
                  label="Seu nome"
                  required
                  error={fieldErrors.userName}
                >
                  <input
                    id="custom-room-user-name"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value.slice(0, 24));
                      clearFieldError("userName");
                    }}
                    placeholder="Como quer ser chamado?"
                    maxLength={24}
                    aria-invalid={!!fieldErrors.userName}
                    aria-describedby={
                      fieldErrors.userName ? "custom-room-user-name-error" : undefined
                    }
                    className={fieldInputClass(!!fieldErrors.userName)}
                  />
                </FormField>
              </section>

              <section className="custom-create-section">
                <h2 className="custom-create-section-title">Sobre a sala</h2>
                <p className="custom-create-section-subtitle">
                  Sala privada — só entra quem tiver o código.
                </p>

                <FormField
                  id="custom-room-nome"
                  label="Nome da sala"
                  required
                  error={fieldErrors.nome}
                >
                  <input
                    id="custom-room-nome"
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value.slice(0, 20));
                      clearFieldError("nome");
                    }}
                    placeholder="Ex.: Sala dos amigos"
                    maxLength={20}
                    aria-invalid={!!fieldErrors.nome}
                    className={fieldInputClass(!!fieldErrors.nome)}
                  />
                </FormField>
                <p className="mt-1.5 text-right text-xs text-ink-muted">
                  {nome.length}/20
                </p>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-4 py-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-lg">
                    🔒
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Sala privada</p>
                    <p className="text-xs text-ink-muted">
                      Você compartilha o código com quem quiser convidar.
                    </p>
                  </div>
                </div>

                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold text-ink">
                    Tipo de sala
                  </legend>
                  <p className="mt-1 text-xs text-ink-muted">
                    Permanentes ficam abertas; temporárias duram 5 horas.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      aria-pressed={roomType === "permanente"}
                      onClick={() => setRoomType("permanente")}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left transition-colors",
                        roomType === "permanente"
                          ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                          : "border-border/60 bg-background hover:border-brand/30"
                      )}
                    >
                      <p className="text-sm font-bold text-ink">Permanente</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        Fica disponível enquanto o anfitrião mantiver aberta.
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-pressed={roomType === "temporaria"}
                      onClick={() => setRoomType("temporaria")}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left transition-colors",
                        roomType === "temporaria"
                          ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                          : "border-border/60 bg-background hover:border-accent/30"
                      )}
                    >
                      <p className="text-sm font-bold text-ink">Temporária (5h)</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        Ideal para uma noite de jogo; expira automaticamente.
                      </p>
                    </button>
                  </div>
                </fieldset>

                {roomType === "permanente" && (
                  <fieldset className="mt-5">
                    <legend className="text-sm font-semibold text-ink">
                      Reset do ranking
                    </legend>
                    <p className="mt-1 text-xs text-ink-muted">
                      Define quando os pontos e progresso da competição zeram.
                    </p>
                    <div className="mt-3 grid gap-2">
                      {(
                        [
                          ["nunca", "Contínuo", "Sem reset automático."],
                          ["semanal", "Semanal", "Reinicia toda segunda-feira."],
                          ["mensal", "Mensal", "Reinicia no dia 1 de cada mês."],
                        ] as const
                      ).map(([value, title, hint]) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={rankingPeriodo === value}
                          onClick={() => setRankingPeriodo(value)}
                          className={cn(
                            "rounded-xl border px-4 py-3 text-left transition-colors",
                            rankingPeriodo === value
                              ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                              : "border-border/60 bg-background hover:border-brand/30"
                          )}
                        >
                          <p className="text-sm font-bold text-ink">{title}</p>
                          <p className="mt-1 text-xs text-ink-muted">{hint}</p>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
              </section>

              <section
                className={cn(
                  "custom-create-section",
                  fieldErrors.modes && "form-field-invalid ring-2 ring-danger/20"
                )}
              >
                <h2 className="custom-create-section-title">Modos e rodadas</h2>
                <p className="custom-create-section-subtitle">
                  Toque em um modo para incluir. Ajuste quantas rodadas de cada.{" "}
                  <span className="text-danger">*</span>
                </p>
                {fieldErrors.modes && (
                  <p className="field-error mb-3" role="alert">
                    {fieldErrors.modes}
                  </p>
                )}

                <div className="mt-1 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {MODE_OPTIONS.map((mode) => {
                    const selected = selectedModes[mode.value] !== undefined;
                    const display = MODE_DISPLAY[mode.value];
                    const rounds = selectedModes[mode.value] ?? 1;

                    return (
                      <div
                        key={mode.value}
                        className={cn(
                          "custom-create-mode-card transition-all",
                          selected
                            ? "custom-create-mode-card-selected ring-2 ring-brand/30"
                            : mode.accent
                        )}
                      >
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleMode(mode.value)}
                          className="w-full text-left outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-brand/40"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-2xl" aria-hidden>
                              {mode.icon}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                mode.badgeClass
                              )}
                            >
                              {display.difficulty}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-lg font-bold text-ink">
                              {display.label}
                            </p>
                            <p className="mt-0.5 text-sm text-ink-muted">
                              {display.subtitle}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                              {display.description}
                            </p>
                            <p className="mt-2 text-[11px] font-medium text-ink-muted">
                              Até {getModeMaxTries(mode.value)} tentativas por
                              rodada
                            </p>
                          </div>
                        </button>

                        {selected && (
                          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                            <span className="text-xs font-semibold text-ink-soft">
                              Rodadas
                            </span>
                            <div className="custom-create-stepper">
                              <button
                                type="button"
                                aria-label={`Diminuir rodadas de ${display.label}`}
                                disabled={rounds <= 1}
                                className="custom-create-stepper-btn"
                                onClick={() =>
                                  updateModeRounds(mode.value, rounds - 1)
                                }
                              >
                                −
                              </button>
                              <span className="custom-create-stepper-value">
                                {rounds}
                              </span>
                              <button
                                type="button"
                                aria-label={`Aumentar rodadas de ${display.label}`}
                                disabled={rounds >= 20}
                                className="custom-create-stepper-btn"
                                onClick={() =>
                                  updateModeRounds(mode.value, rounds + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {error && Object.keys(fieldErrors).length === 0 && (
                <p
                  className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-success w-full lg:hidden"
              >
                {creating ? "Criando sala..." : "Criar sala e ir ao lobby"}
              </button>
            </form>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="custom-create-summary">
                <h2 className="text-lg font-bold text-ink">Resumo da partida</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Confira antes de criar a sala.
                </p>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <dt className="text-ink-muted">Anfitrião</dt>
                    <dd className="font-semibold text-ink">
                      {userName.trim() || "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <dt className="text-ink-muted">Sala</dt>
                    <dd className="font-semibold text-ink">
                      {nome.trim() || "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <dt className="text-ink-muted">Tipo</dt>
                    <dd className="font-semibold text-ink">
                      {roomType === "temporaria" ? "Temporária (5h)" : "Permanente"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <dt className="text-ink-muted">Ranking</dt>
                    <dd className="font-semibold text-ink">
                      {roomType === "temporaria"
                        ? "Por partida"
                        : formatRankingPeriodoLabel(rankingPeriodo)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <dt className="text-ink-muted">Total de rodadas</dt>
                    <dd className="font-semibold text-brand">
                      {totalRodadas || "—"}
                    </dd>
                  </div>
                </dl>

                {selectedModeEntries.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {selectedModeEntries.map(({ modo, rodadas, label }) => (
                      <li
                        key={modo}
                        className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-ink">{label}</span>
                        <span className="font-semibold text-ink-muted">
                          ×{rodadas}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-lg bg-background px-3 py-3 text-sm text-ink-muted">
                    Nenhum modo selecionado ainda.
                  </p>
                )}

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleCreate}
                  className="btn-success mt-6 hidden w-full lg:flex"
                >
                  {creating ? "Criando sala..." : "Criar sala e ir ao lobby"}
                </button>

                {creating && (
                  <p className="mt-4 text-center text-sm font-medium text-brand">
                    Preparando o lobby...
                  </p>
                )}

                <div className="mt-6 border-t border-border/60 pt-5">
                  <p className="text-sm text-ink-muted">
                    Já tem um código?
                  </p>
                  <Link
                    to="/custom/entrar"
                    className="mt-2 inline-flex text-sm font-semibold text-brand hover:text-brand-hover"
                  >
                    Entrar em uma sala existente →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomRoomCreatePage;
