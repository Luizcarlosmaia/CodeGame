import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Crown, Play, Trash2, LogOut, RotateCcw, Clock, UserX } from "lucide-react";
import CustomRoomChat from "./CustomRoomChat";
import CustomRoomLobbySettings from "./CustomRoomLobbySettings";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import BackButton from "../BackButton";
import CustomRoomRanking from "./CustomRoomRanking";
import { ConfirmModal } from "../ConfirmModal";
import { cn } from "../../lib/cn";
import { getModeLabel } from "../../utils/modeLabels";
import { computeRoomRanking, getRoomAgeDays } from "../../utils/customRoomStats";
import {
  formatExpiryCountdown,
  isTemporaryRoom,
  isTemporaryRoomExpired,
} from "../../utils/customRoomLifecycle";
import type { RoomSettingsPayload } from "../../utils/customRoomSettings";

interface CustomRoomLobbyProps {
  roomId: string;
  userId: string;
  userName: string;
}

function getModeIcon(modo: string): string {
  if (modo === "casual") return "🎨";
  if (modo === "codigo-mestre") return "🎯";
  return "🧮";
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function aggregateModes(
  rodadas: Array<{ modo?: string }>,
  fallbackModo: string
): Array<{ modo: string; count: number }> {
  const counts = rodadas.reduce<Record<string, number>>((acc, round) => {
    const modo = round.modo || fallbackModo;
    acc[modo] = (acc[modo] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([modo, count]) => ({ modo, count }));
}

const CustomRoomLobby: React.FC<CustomRoomLobbyProps> = ({
  roomId,
  userId,
  userName,
}) => {
  const { room, loading, error, leaveRoom, deleteRoom, transferOwnership, startNewMatch, updateRoomSettings } =
    useCustomRoom(roomId);
  const [leaving, setLeaving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [startingNewMatch, setStartingNewMatch] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [countdownNow, setCountdownNow] = useState(() => Date.now());
  const [permissaoVerificada, setPermissaoVerificada] = useState(false);
  const [temPermissao, setTemPermissao] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingAction, setPendingAction] = useState<"delete" | "leave" | null>(
    null
  );
  const [transferTarget, setTransferTarget] = useState<{
    id: string;
    nome: string;
  } | null>(null);
  const [kickTarget, setKickTarget] = useState<{
    id: string;
    nome: string;
  } | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [kicking, setKicking] = useState(false);
  const navigate = useNavigate();

  const isOwner = room?.ownerId === userId;
  const ownerName =
    room?.membros.find((member) => member.id === room.ownerId)?.nome ?? "—";

  const modeSummary = useMemo(() => {
    if (room?.modos?.length) {
      return room.modos.map((entry) => ({
        modo: entry.modo,
        count: entry.rodadas,
      }));
    }

    if (room?.rodadas?.length) {
      return aggregateModes(
        room.rodadas as Array<{ modo?: string }>,
        room.modo || "casual"
      );
    }

    return [];
  }, [room]);

  const totalRodadas = room?.rodadas?.length ?? 0;
  const ranking = useMemo(() => {
    if (!room) return [];
    return computeRoomRanking(room.membros, room.rodadas ?? [], room);
  }, [room]);
  const roomAgeDays =
    room?.type === "permanente" && room.criadaEm
      ? getRoomAgeDays(room.criadaEm)
      : null;
  const isTemporary = room ? isTemporaryRoom(room) : false;
  const isExpired = room ? isTemporaryRoomExpired(room, countdownNow) : false;
  const expiryLabel =
    room?.expiraEm && isTemporary
      ? formatExpiryCountdown(room.expiraEm, countdownNow)
      : null;

  React.useEffect(() => {
    if (!room?.expiraEm || !isTemporary || isExpired) return;

    const interval = setInterval(() => setCountdownNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [room?.expiraEm, isTemporary, isExpired]);

  React.useEffect(() => {
    if (isLeaving || loading || !room || !userId) return;

    const isMember = Array.isArray(room.membros)
      ? room.membros.some((member) => member.id === userId)
      : false;

    setPermissaoVerificada(true);
    setTemPermissao(isMember);

    if (!isMember) {
      navigate("/custom/entrar", { replace: true });
    }
  }, [room, userId, loading, isLeaving, navigate]);

  React.useEffect(() => {
    if (room && room.type === "permanente" && room.aberta === false) {
      navigate("/", { replace: true });
    }
  }, [room, navigate]);

  const handleCopyCode = async () => {
    if (!room) return;

    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleStartGame = () => {
    if (isExpired) return;
    navigate(`/custom/game/${roomId}`);
  };

  const handleStartNewMatch = async () => {
    if (!room || !isOwner || startingNewMatch || isExpired) return;

    setStartingNewMatch(true);
    setActionError("");

    const success = await startNewMatch(roomId, userId);
    setStartingNewMatch(false);

    if (!success) {
      setActionError("Não foi possível iniciar uma nova partida. Tente novamente.");
    }
  };

  const handleSaveSettings = async (patch: Omit<RoomSettingsPayload, "userId">) => {
    if (!room || savingSettings || isExpired) return false;

    setSavingSettings(true);
    setActionError("");

    const success = await updateRoomSettings(roomId, {
      userId,
      ...patch,
    });

    setSavingSettings(false);

    if (!success) {
      setActionError("Não foi possível salvar as configurações da sala.");
    }

    return success;
  };

  const executeKick = async () => {
    if (!kickTarget || kicking || !room) return;

    setKicking(true);
    setActionError("");

    const success = await updateRoomSettings(roomId, {
      userId,
      kickMemberId: kickTarget.id,
    });

    setKicking(false);

    if (!success) {
      setActionError("Não foi possível expulsar o jogador. Tente novamente.");
      return;
    }

    setKickTarget(null);
  };

  const openLeaveOrDeleteConfirm = () => {
    if (leaving || !room) return;
    setActionError("");
    setPendingAction(room.ownerId === userId ? "delete" : "leave");
  };

  const executeLeaveOrDelete = async () => {
    if (leaving || !room || !pendingAction) return;

    const isDelete = pendingAction === "delete";

    setLeaving(true);
    setIsLeaving(true);
    setActionError("");

    const success = isDelete
      ? await deleteRoom(roomId)
      : (await leaveRoom(roomId, userId, true)) === true;

    setLeaving(false);
    setIsLeaving(false);

    if (!success) {
      setActionError(
        isDelete
          ? "Não foi possível excluir a sala. Tente novamente."
          : "Não foi possível abandonar a sala. Tente novamente."
      );
      return;
    }

    setPendingAction(null);
    navigate("/custom/entrar");
  };

  const executeTransfer = async () => {
    if (!transferTarget || transferring || !room) return;

    setTransferring(true);
    setActionError("");

    const success = await transferOwnership(
      roomId,
      userId,
      transferTarget.id
    );

    setTransferring(false);

    if (!success) {
      setActionError("Não foi possível transferir a anfitrião. Tente novamente.");
      return;
    }

    setTransferTarget(null);
  };

  const otherMembers =
    room?.membros.filter(
      (member) => member.id !== userId && member.id !== room.ownerId
    ) ?? [];

  if (loading || !permissaoVerificada) {
    return (
      <div className="custom-lobby-page">
        <div className="h-16" aria-hidden />
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <div className="custom-lobby-spinner" aria-hidden />
          <p className="mt-4 text-base font-semibold text-ink">
            {loading ? "Carregando sala..." : "Verificando acesso..."}
          </p>
        </div>
      </div>
    );
  }

  if (!temPermissao) {
    return null;
  }

  return (
    <div className="custom-lobby-page">
      <div className="h-16" aria-hidden />

      <main className="relative overflow-hidden pb-12">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -right-24 top-0 size-[420px] rounded-full bg-brand/6 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-[360px] rounded-full bg-success/6 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <BackButton to="/custom/entrar" className="mb-4" />

          {error && (
            <p
              className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          {actionError && (
            <p
              className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
              role="alert"
            >
              {actionError}
            </p>
          )}

          {room && isTemporary && isExpired && (
            <div
              className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-ink"
              role="status"
            >
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Esta sala temporária expirou.
              </p>
              <p className="mt-1 text-ink-muted">
                Não é possível jogar nem entrar com o código. O anfitrião pode
                excluir a sala ou criar uma nova.
              </p>
            </div>
          )}

          {!room && !loading && (
            <div className="custom-create-section text-center">
              <p className="text-base font-semibold text-ink">
                Sala não encontrada ou já foi fechada.
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Verifique o código ou crie uma nova sala.
              </p>
            </div>
          )}

          {room && (
            <>
              <div className="custom-lobby-hero">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                      {isTemporary ? "Sala temporária" : "Lobby"}
                    </span>
                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      {room.nome}
                    </h1>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                      <Crown size={16} aria-hidden />
                      Anfitrião:{" "}
                      <span className="font-semibold text-white">{ownerName}</span>
                      {isOwner && (
                        <span className="rounded-full bg-[#ffd600]/90 px-2 py-0.5 text-[11px] font-bold text-ink">
                          Você
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="custom-lobby-code-box">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Código da sala
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xl font-bold tracking-[0.18em] text-ink sm:text-2xl">
                        {room.id}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="custom-lobby-copy-btn"
                        aria-label={copied ? "Código copiado" : "Copiar código da sala"}
                        title={copied ? "Copiado!" : "Copiar código"}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span>{copied ? "Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">
                      Compartilhe com quem vai entrar na partida.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  <div className="custom-lobby-stat-pill">
                    <span className="custom-lobby-stat-value">
                      {room.membros.length}
                    </span>
                    <span className="custom-lobby-stat-label">Jogadores</span>
                  </div>
                  <div className="custom-lobby-stat-pill">
                    <span className="custom-lobby-stat-value">{totalRodadas}</span>
                    <span className="custom-lobby-stat-label">Rodadas</span>
                  </div>
                  <div className="custom-lobby-stat-pill">
                    <span className="custom-lobby-stat-value">
                      {modeSummary.length}
                    </span>
                    <span className="custom-lobby-stat-label">Modos</span>
                  </div>
                  {isTemporary && expiryLabel && (
                    <div className="custom-lobby-stat-pill">
                      <span className="custom-lobby-stat-value">{expiryLabel}</span>
                      <span className="custom-lobby-stat-label flex items-center justify-center gap-1">
                        <Clock size={12} aria-hidden />
                        {isExpired ? "Expirada" : "Restante"}
                      </span>
                    </div>
                  )}
                  {roomAgeDays !== null && (
                    <div className="custom-lobby-stat-pill">
                      <span className="custom-lobby-stat-value">{roomAgeDays}</span>
                      <span className="custom-lobby-stat-label">Dias ativa</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
                <div className="flex flex-col gap-5">
                  <section className="custom-create-section">
                    <h2 className="custom-create-section-title">Participantes</h2>
                    <p className="custom-create-section-subtitle">
                      Quem está na sala agora.
                      {isOwner && otherMembers.length > 0 && (
                        <> Toque nos botões ao lado de um jogador para transferir ou expulsar.</>
                      )}
                    </p>

                    <ul className="space-y-2">
                      {room.membros.map((member) => {
                        const isCurrentUser = member.id === userId;
                        const isRoomOwner = member.id === room.ownerId;

                        return (
                          <li
                            key={member.id}
                            className={cn(
                              "custom-lobby-member-row",
                              isCurrentUser && "custom-lobby-member-row-you"
                            )}
                          >
                            <span
                              className="custom-lobby-avatar"
                              aria-hidden
                            >
                              {getInitials(member.nome)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-ink">
                                {member.nome}
                              </p>
                              <p className="text-xs text-ink-muted">
                                {isRoomOwner ? "Anfitrião" : "Jogador"}
                              </p>
                            </div>
                            {isRoomOwner && (
                              <span className="custom-lobby-owner-badge">
                                ★ Dono
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="text-xs font-semibold text-brand">
                                Você
                              </span>
                            )}
                            {isOwner &&
                              !isCurrentUser &&
                              !isRoomOwner && (
                                <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setTransferTarget({
                                        id: member.id,
                                        nome: member.nome,
                                      })
                                    }
                                    className="custom-lobby-transfer-btn"
                                  >
                                    <Crown size={14} aria-hidden />
                                    Tornar anfitrião
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setKickTarget({
                                        id: member.id,
                                        nome: member.nome,
                                      })
                                    }
                                    className="custom-lobby-transfer-btn text-danger hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
                                  >
                                    <UserX size={14} aria-hidden />
                                    Expulsar
                                  </button>
                                </div>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  {isOwner && !isExpired && (
                    <CustomRoomLobbySettings
                      room={room}
                      saving={savingSettings}
                      onSave={handleSaveSettings}
                    />
                  )}

                  <section className="custom-create-section">
                    <h2 className="custom-create-section-title">
                      Configuração da partida
                    </h2>
                    <p className="custom-create-section-subtitle">
                      Modos e quantidade de rodadas.
                    </p>

                    {modeSummary.length > 0 ? (
                      <ul className="flex flex-wrap gap-2">
                        {modeSummary.map(({ modo, count }) => (
                          <li key={modo} className="custom-join-mode-chip">
                            <span aria-hidden>{getModeIcon(modo)}</span>
                            {getModeLabel(modo)} ×{count}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-ink-muted">
                        Nenhuma rodada configurada ainda.
                      </p>
                    )}
                  </section>

                  <button
                    type="button"
                    onClick={handleStartGame}
                    disabled={isExpired}
                    className="btn-success flex w-full items-center justify-center gap-2 py-3.5 text-lg disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
                  >
                    <Play size={20} aria-hidden />
                    {isExpired ? "Sala expirada" : "Iniciar Jogo"}
                  </button>

                  {isOwner && isTemporary && !isExpired && (
                    <button
                      type="button"
                      onClick={handleStartNewMatch}
                      disabled={startingNewMatch}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-60 lg:hidden"
                    >
                      <RotateCcw size={18} aria-hidden />
                      {startingNewMatch ? "Reiniciando..." : "Nova partida"}
                    </button>
                  )}

                  <div className="custom-create-section lg:hidden">
                    <h2 className="custom-create-section-title">Ranking</h2>
                    <p className="custom-create-section-subtitle">
                      Mais pontos = melhor colocação.
                    </p>
                    <CustomRoomRanking
                      ranking={ranking}
                      membros={room.membros}
                      userId={userId}
                      totalRodadas={totalRodadas}
                      showStatus={false}
                      roomType={room.type}
                      roomCreatedAt={room.criadaEm}
                      partidaNumero={room.partidaNumero}
                      rankingPeriodo={room.rankingPeriodo}
                      rankingResetEm={room.rankingResetEm}
                    />
                  </div>

                  <div className="lg:hidden">
                    <CustomRoomChat
                      roomId={roomId}
                      userId={userId}
                      userName={userName}
                    />
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      disabled={leaving}
                      onClick={openLeaveOrDeleteConfirm}
                      className={cn(
                        "custom-lobby-danger-btn",
                        leaving && "opacity-60"
                      )}
                    >
                      {isOwner ? (
                        <>
                          <Trash2 size={18} aria-hidden />
                          Excluir sala
                        </>
                      ) : (
                        <>
                          <LogOut size={18} aria-hidden />
                          Abandonar sala
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <aside className="hidden flex-col gap-5 lg:flex lg:sticky lg:top-24 lg:self-start">
                  <div className="custom-create-summary">
                    <button
                      type="button"
                      onClick={handleStartGame}
                      disabled={isExpired}
                      className="btn-success flex w-full items-center justify-center gap-2 py-3.5 text-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Play size={20} aria-hidden />
                      {isExpired ? "Sala expirada" : "Iniciar Jogo"}
                    </button>

                    {isOwner && isTemporary && !isExpired && (
                      <button
                        type="button"
                        onClick={handleStartNewMatch}
                        disabled={startingNewMatch}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-60"
                      >
                        <RotateCcw size={18} aria-hidden />
                        {startingNewMatch ? "Reiniciando..." : "Nova partida"}
                      </button>
                    )}

                    <div className="mt-6 border-t border-border/60 pt-5">
                      <h2 className="text-lg font-bold text-ink">Ranking</h2>
                      <p className="mt-1 text-sm text-ink-muted">
                        Mais pontos = melhor colocação.
                      </p>
                      <div className="mt-4">
                        <CustomRoomRanking
                          ranking={ranking}
                          membros={room.membros}
                          userId={userId}
                          totalRodadas={totalRodadas}
                          showStatus={false}
                          roomType={room.type}
                          roomCreatedAt={room.criadaEm}
                          partidaNumero={room.partidaNumero}
                          rankingPeriodo={room.rankingPeriodo}
                          rankingResetEm={room.rankingResetEm}
                        />
                      </div>
                    </div>
                  </div>

                  <CustomRoomChat
                    roomId={roomId}
                    userId={userId}
                    userName={userName}
                  />
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <ConfirmModal
        open={pendingAction === "delete"}
        title="Excluir sala?"
        description="Esta ação remove a sala para todos os jogadores e não pode ser desfeita."
        confirmLabel="Sim, excluir"
        variant="danger"
        loading={leaving}
        onConfirm={executeLeaveOrDelete}
        onCancel={() => {
          if (!leaving) setPendingAction(null);
        }}
      />

      <ConfirmModal
        open={pendingAction === "leave"}
        title="Abandonar sala?"
        description="Você sairá da sala, mas poderá entrar de novo depois com o mesmo código."
        confirmLabel="Sim, abandonar"
        variant="danger"
        loading={leaving}
        onConfirm={executeLeaveOrDelete}
        onCancel={() => {
          if (!leaving) setPendingAction(null);
        }}
      />

      <ConfirmModal
        open={kickTarget !== null}
        title="Expulsar jogador?"
        description={
          kickTarget
            ? `${kickTarget.nome} sairá da sala agora. O progresso fica guardado caso entre de novo.`
            : ""
        }
        confirmLabel="Sim, expulsar"
        variant="danger"
        loading={kicking}
        onConfirm={executeKick}
        onCancel={() => {
          if (!kicking) setKickTarget(null);
        }}
      />

      <ConfirmModal
        open={transferTarget !== null}
        title="Transferir anfitrião?"
        description={
          transferTarget
            ? `${transferTarget.nome} passará a controlar a sala, incluindo excluir ou transferir de novo.`
            : ""
        }
        confirmLabel="Sim, transferir"
        variant="default"
        loading={transferring}
        onConfirm={executeTransfer}
        onCancel={() => {
          if (!transferring) setTransferTarget(null);
        }}
      />
    </div>
  );
};

export default CustomRoomLobby;
