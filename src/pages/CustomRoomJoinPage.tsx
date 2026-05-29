import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { FormField, fieldInputClass } from "../components/FormField";
import { useCustomRoom } from "../hooks/useCustomRoom";
import { roomsApi } from "../api/roomsApi";
import { getModeLabel } from "../utils/modeLabels";
import {
  formatExpiryCountdown,
  isRoomPlayable,
} from "../utils/customRoomLifecycle";
import { fetchMyCustomRooms } from "../utils/customRoomStorage";
import { markRoomAccessGranted } from "../utils/customRoomAccess";
import { applyGuestResumeFromUrl, parseResumeSearchParams } from "../utils/customRoomResume";
import { useAuth } from "../contexts/AuthContext";
import type { RoomType } from "../types/customRoom";

type MyRoom = {
  id: string;
  nome: string;
  modos: { modo: string; rodadas: number }[];
  type: RoomType;
  expiraEm?: string;
};

function getModeIcon(modo: string): string {
  if (modo === "casual") return "🎨";
  if (modo === "codigo-mestre") return "🎯";
  return "🧮";
}

function normalizeRoomCode(value: string): string {
  return value.toUpperCase().replace(/\s/g, "").slice(0, 32);
}

const CustomRoomJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinRoom } = useCustomRoom();
  const { user: authUser } = useAuth();

  const [userName, setUserName] = useState(
    () => localStorage.getItem("customRoomUserName") || ""
  );
  const [joinId, setJoinId] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    userName?: string;
    joinId?: string;
  }>({});
  const [myRooms, setMyRooms] = useState<MyRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const loadMyRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const rooms = await fetchMyCustomRooms();
      setMyRooms(
        rooms.map((room) => ({
          id: room.id,
          nome: room.nome || "Sala sem nome",
          modos: room.modos || [],
          type: room.type,
          expiraEm: room.expiraEm,
        }))
      );
    } catch {
      setMyRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    loadMyRooms();
  }, [loadMyRooms]);

  useEffect(() => {
    const codeFromUrl = searchParams.get("codigo");
    if (codeFromUrl) {
      setJoinId(normalizeRoomCode(codeFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    const codeFromUrl = searchParams.get("codigo");
    const { memberId, token } = parseResumeSearchParams(
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    );
    if (!codeFromUrl || !memberId || !token) return;

    const roomCode = normalizeRoomCode(codeFromUrl);
    void (async () => {
      const ok = await applyGuestResumeFromUrl(
        roomCode,
        `?member=${encodeURIComponent(memberId)}&token=${encodeURIComponent(token)}`
      );
      if (ok) {
        navigate(`/custom/lobby/${roomCode}`, { replace: true });
      }
    })();
  }, [searchParams, navigate]);

  const totalMyRooms = myRooms.length;

  const canSubmit = !joining;

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
    const code = normalizeRoomCode(joinId);
    const nextErrors: typeof fieldErrors = {};

    if (!userName.trim()) {
      nextErrors.userName = "Digite seu nome para entrar na sala.";
    }
    if (!code) {
      nextErrors.joinId = "Digite o código da sala.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstMessage = nextErrors.userName ?? nextErrors.joinId ?? "";
      setError(firstMessage);
      if (window.navigator.vibrate) window.navigator.vibrate(120);
      return false;
    }

    setError("");
    return true;
  };

  const enterRoom = async (roomId: string) => {
    let thisUserId = localStorage.getItem(`customRoomUserId_${roomId}`);
    const trimmedName = userName.trim();

    if (!thisUserId) {
      thisUserId = `user-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(`customRoomUserId_${roomId}`, thisUserId);
    }

    localStorage.setItem("customRoomUserName", trimmedName);

    const joinResult = await joinRoom(roomId, {
      id: thisUserId,
      nome: trimmedName,
      terminouRodada: false,
      tentativas: [],
      ...(authUser ? { accountId: authUser.id } : {}),
    });

    if (joinResult === "already_joined" || joinResult === true) {
      markRoomAccessGranted(roomId);
      navigate(`/custom/lobby/${roomId}`);
      return true;
    }

    return false;
  };

  const handleJoin = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (joining || !validateForm()) return;

    const code = normalizeRoomCode(joinId);
    setJoining(true);

    try {
      const exists = await roomsApi.roomExists(code);
      if (!exists) {
        setError("Sala não encontrada. Verifique o código e tente de novo.");
        setFieldErrors({ joinId: "Sala não encontrada. Verifique o código." });
        return;
      }

      const roomPreview = await roomsApi.getRoom(code);
      if (!roomPreview || !isRoomPlayable(roomPreview)) {
        setError("Esta sala expirou ou está fechada.");
        setFieldErrors({ joinId: "Esta sala expirou ou está fechada." });
        return;
      }

      const success = await enterRoom(code);
      if (!success) {
        setError("Erro ao entrar na sala. Verifique sua conexão e tente de novo.");
      }
    } catch {
      setError("Erro ao entrar na sala. Verifique sua conexão e tente de novo.");
    } finally {
      setJoining(false);
    }
  };

  const modeSummary = useMemo(
    () =>
      (modos: MyRoom["modos"]) =>
        modos.map((entry) => ({
          ...entry,
          label: getModeLabel(entry.modo),
          icon: getModeIcon(entry.modo),
        })),
    []
  );

  return (
    <div className="custom-create-page">
      <div className="h-16" aria-hidden />

      <main className="relative overflow-hidden pb-12">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-24 top-0 size-[420px] rounded-full bg-brand/6 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 size-[360px] rounded-full bg-success/6 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <BackButton to="/home" className="mb-4" />

          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-brand">
              Multiplayer
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Entrar em uma sala
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              Use o código que o anfitrião compartilhou ou volte para uma sala
              em que você já participa.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <form
              onSubmit={handleJoin}
              autoComplete="off"
              className="flex flex-col gap-5"
            >
              <section className="custom-create-section">
                <h2 className="custom-create-section-title">Quem é você</h2>
                <p className="custom-create-section-subtitle">
                  Esse nome aparece para os outros jogadores na sala.
                </p>

                <FormField
                  id="custom-join-user-name"
                  label="Seu nome"
                  required
                  error={fieldErrors.userName}
                >
                  <input
                    id="custom-join-user-name"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value.slice(0, 24));
                      clearFieldError("userName");
                    }}
                    placeholder="Como quer ser chamado?"
                    maxLength={24}
                    aria-invalid={!!fieldErrors.userName}
                    className={fieldInputClass(!!fieldErrors.userName)}
                  />
                </FormField>
              </section>

              <section className="custom-create-section">
                <h2 className="custom-create-section-title">Código da sala</h2>

                <FormField
                  id="custom-join-room-code"
                  label="Código"
                  required
                  error={fieldErrors.joinId}
                  hint="O anfitrião envia um código de 10 caracteres — letras e números."
                >
                  <input
                    id="custom-join-room-code"
                    value={joinId}
                    onChange={(e) => {
                      setJoinId(normalizeRoomCode(e.target.value));
                      clearFieldError("joinId");
                    }}
                    placeholder="Ex.: A3K9M2PLQ1"
                    maxLength={32}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-invalid={!!fieldErrors.joinId}
                    className={fieldInputClass(
                      !!fieldErrors.joinId,
                      "font-mono text-lg tracking-widest uppercase"
                    )}
                  />
                </FormField>
                <p className="mt-1.5 text-right text-xs text-ink-muted">
                  {joinId.length} caracteres
                </p>
              </section>

              {error && (
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
                {joining ? "Entrando na sala..." : "Entrar no lobby"}
              </button>
            </form>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="custom-create-summary">
                <h2 className="text-lg font-bold text-ink">Minhas salas</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Salas ativas em que você já participa neste dispositivo.
                </p>

                {loadingRooms ? (
                  <div className="mt-5 space-y-3">
                    {[0, 1].map((item) => (
                      <div
                        key={item}
                        className="custom-join-room-skeleton h-28 animate-pulse rounded-xl"
                      />
                    ))}
                  </div>
                ) : myRooms.length > 0 ? (
                  <ul className="mt-5 space-y-3">
                    {myRooms.map((room) => {
                      const modes = modeSummary(room.modos);
                      const totalRodadas = modes.reduce(
                        (sum, entry) => sum + entry.rodadas,
                        0
                      );

                      return (
                        <li key={room.id}>
                          <button
                            type="button"
                            onClick={() => {
                              markRoomAccessGranted(room.id);
                              navigate(`/custom/lobby/${room.id}`);
                            }}
                            className="custom-join-room-card w-full text-left"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-base font-bold text-ink">
                                  {room.nome}
                                </p>
                                <p className="mt-1 font-mono text-xs font-semibold tracking-wide text-ink-muted">
                                  {room.id}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand">
                                {totalRodadas} rod.
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-ink-muted">
                              {room.type === "temporaria" ? (
                                <>
                                  Temporária
                                  {room.expiraEm
                                    ? ` · ${formatExpiryCountdown(room.expiraEm)}`
                                    : ""}
                                </>
                              ) : (
                                "Permanente"
                              )}
                            </p>

                            {modes.length > 0 ? (
                              <ul className="mt-3 flex flex-wrap gap-1.5">
                                {modes.map((entry) => (
                                  <li
                                    key={`${room.id}-${entry.modo}`}
                                    className="custom-join-mode-chip"
                                  >
                                    <span aria-hidden>{entry.icon}</span>
                                    {entry.label} ×{entry.rodadas}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-3 text-xs text-ink-muted">
                                Sem modos configurados
                              </p>
                            )}

                            <span className="mt-3 inline-flex text-sm font-semibold text-brand">
                              Ir para o lobby →
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-5 rounded-xl bg-background px-4 py-5 text-center">
                    <p className="text-sm font-medium text-ink">
                      Nenhuma sala salva ainda
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Entre com um código ou crie uma nova sala.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => handleJoin()}
                  className="btn-success mt-6 hidden w-full lg:flex"
                >
                  {joining ? "Entrando na sala..." : "Entrar no lobby"}
                </button>

                <div className="mt-6 border-t border-border/60 pt-5">
                  <p className="text-sm text-ink-muted">
                    Quer ser anfitrião?
                  </p>
                  <Link
                    to="/custom/criar"
                    className="mt-2 inline-flex text-sm font-semibold text-brand hover:text-brand-hover"
                  >
                    Criar uma sala personalizada →
                  </Link>
                </div>

                {!loadingRooms && totalMyRooms > 0 && (
                  <button
                    type="button"
                    onClick={loadMyRooms}
                    className="mt-4 w-full text-sm font-medium text-ink-muted transition-colors hover:text-brand"
                  >
                    Atualizar lista
                  </button>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomRoomJoinPage;
