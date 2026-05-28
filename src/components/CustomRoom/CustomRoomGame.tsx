import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import { roomsApi } from "../../api/roomsApi";
import { getCustomRoomDailyCode } from "../../utils/customRoomDailyCode";
import {
  findRoundProgress,
  getCustomRoomCodeSessionKey,
  getCustomRoomProgressKey,
  removeRoundProgressEntries,
} from "../../utils/customRoomProgress";
import { isRoomPlayable } from "../../utils/customRoomLifecycle";
import {
  getModeMaxTries,
  isCustomRoomMode,
  type CustomRoomMode,
} from "../../utils/modeLabels";
import { computeRoomRanking, getRoomAgeDays } from "../../utils/customRoomStats";
import BackButton from "../BackButton";
import CustomRoomRanking from "./CustomRoomRanking";
import { CustomRoomRounds } from "./CustomRoomRounds";
import CustomRoomRodadaPainel from "./CustomRoomRodadaPainel";
import {
  parseGuess,
  serializeGuess,
} from "./customRoomGuessDisplay";
import { isGuessCorrect } from "../../utils/verifyGuess";
import {
  canAccessProtectedRoom,
  getProtectedRoomEntryPath,
} from "../../utils/customRoomAccess";

const CustomRoomGame: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [rodadaAberta, setRodadaAberta] = useState<number | null>(null);

  const userId = useMemo(() => {
    if (!roomId) return "";
    return localStorage.getItem(`customRoomUserId_${roomId}`) || "";
  }, [roomId]);

  const { room, loading, error } = useCustomRoom(roomId);

  const accessCheckedRef = React.useRef(false);

  const [guesses, setGuesses] = useState<string[][]>([]);
  const [inputDigits, setInputDigits] = useState<string[]>(["", "", "", ""]);
  const [hasWon, setHasWon] = useState(false);
  const [hasFinished, setHasFinished] = useState<null | {
    win: boolean;
    tries: number;
  }>(null);
  const [rodadaInfo, setRodadaInfo] = useState<{
    rodadaIdx: number;
    rodada: RodadaConfig;
    modo: string;
    code: string[];
    maxTries: number;
  } | null>(null);

  // --- NOVA LÓGICA: só renderiza o dashboard moderno e overlay de rodada ---

  let renderContent: React.ReactNode = null;

  const player =
    room && room.membros
      ? room.membros.find((m) => m.id === userId)
      : undefined;

  React.useEffect(() => {
    if (!roomId || loading || !room || accessCheckedRef.current) return;

    accessCheckedRef.current = true;
    if (!canAccessProtectedRoom(room, userId, roomId)) {
      navigate(getProtectedRoomEntryPath(roomId), { replace: true });
    }
  }, [room, userId, roomId, loading, navigate]);

  if (loading) {
    renderContent = (
      <div className="custom-create-page">
        <div className="h-16" aria-hidden />
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <div className="custom-lobby-spinner" aria-hidden />
          <p className="mt-4 text-base font-semibold text-ink">
            Carregando partida...
          </p>
        </div>
      </div>
    );
  } else if (error) {
    renderContent = (
      <div className="custom-create-page px-4 py-20">
        <p className="mx-auto max-w-md rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-center text-sm font-medium text-danger">
          {error}
        </p>
      </div>
    );
  } else if (!room) {
    renderContent = (
      <div className="custom-create-page px-4 py-20">
        <p className="mx-auto max-w-md rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-center text-sm font-medium text-danger">
          Sala não encontrada.
        </p>
      </div>
    );
  } else if (!isRoomPlayable(room)) {
    renderContent = (
      <div className="custom-create-page px-4 py-20 text-center">
        <p className="mx-auto max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-ink">
          Esta sala expirou ou está fechada. Volte ao lobby ou entre em outra
          sala.
        </p>
      </div>
    );
  } else if (!player) {
    renderContent = (
      <div className="custom-create-page">
        <div className="h-16" aria-hidden />
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <div className="custom-lobby-spinner" aria-hidden />
          <p className="mt-4 text-base font-semibold text-ink">
            Entrando na partida...
          </p>
        </div>
      </div>
    );
  }

  type RodadaConfig = { rodada: number; modo?: string; codigo?: string };

  // --- Sincronização robusta: só sobrescreve progresso local se remoto mudou e não houve alteração local recente ---
  const lastRemoteProgressRef = React.useRef<{
    rodada: number;
    data: string;
    palpites: string[];
    terminou: boolean;
    win: boolean;
    tentativas: number;
  } | null>(null);
  // Flag para saber se houve alteração local desde o último sync remoto
  const localChangedRef = React.useRef(false);

  // Sempre que guesses mudam localmente, marca que houve alteração local
  React.useEffect(() => {
    localChangedRef.current = true;
  }, [guesses, hasWon, hasFinished]);

  React.useEffect(() => {
    if (
      rodadaAberta === null ||
      !room ||
      !room.id ||
      !room.rodadas ||
      room.rodadas.length === 0
    ) {
      setRodadaInfo(null);
      setGuesses([]);
      setInputDigits(["", "", "", ""]);
      setHasWon(false);
      setHasFinished(null);
      lastRemoteProgressRef.current = null;
      localChangedRef.current = false;
      return;
    }

    const rodadasConfig: RodadaConfig[] =
      room.rodadas && room.rodadas.length > 0
        ? (room.rodadas as RodadaConfig[])
        : Array.from({ length: 1 }, (_, i) => ({
            rodada: i + 1,
            modo: "casual",
          }));
    const player = room.membros
      ? room.membros.find((m) => m.id === userId)
      : undefined;

    const rodadaIdx = rodadasConfig.findIndex((r) => r.rodada === rodadaAberta);
    const rodada = rodadasConfig[rodadaIdx];
    if (!rodada) {
      setRodadaInfo(null);
      setGuesses([]);
      setInputDigits(["", "", "", ""]);
      setHasWon(false);
      setHasFinished(null);
      lastRemoteProgressRef.current = null;
      localChangedRef.current = false;
      return;
    }

    const modo = isCustomRoomMode(rodada.modo ?? "") ? rodada.modo! : "casual";
    const codeSessionKey = getCustomRoomCodeSessionKey(room, player, rodada.rodada);
    const code = getCustomRoomDailyCode(
      room.id,
      rodada.rodada,
      modo,
      codeSessionKey
    );
    const maxTries = getModeMaxTries(modo as CustomRoomMode);
    setRodadaInfo({ rodadaIdx, rodada, modo, code, maxTries });

    const progresso = findRoundProgress(player, rodada.rodada, room);
    if (progresso) {
      const palpitesFirestore = Array.isArray(progresso.palpites)
        ? progresso.palpites
        : [];
      const palpitesLocal = guesses.map((g) =>
        serializeGuess(g, modo)
      );
      const isSameGuesses =
        palpitesFirestore.length === palpitesLocal.length &&
        palpitesFirestore.every((p, i) => p === palpitesLocal[i]);
      const isSameWin = hasWon === !!progresso.win;
      const isSameFinished =
        (hasFinished?.win ?? null) ===
          (progresso.terminou ? !!progresso.win : null) &&
        (hasFinished?.tries ?? null) ===
          (progresso.terminou ? progresso.tentativas : null);

      // Só sincroniza se o progresso remoto for diferente do local
      const remoteObj = {
        rodada: progresso.rodada,
        data: progresso.data,
        palpites: palpitesFirestore,
        terminou: !!progresso.terminou,
        win: !!progresso.win,
        tentativas: progresso.tentativas,
      };
      const lastRemote = lastRemoteProgressRef.current;
      const isRemoteChanged =
        !lastRemote ||
        lastRemote.rodada !== remoteObj.rodada ||
        lastRemote.data !== remoteObj.data ||
        lastRemote.palpites.length !== remoteObj.palpites.length ||
        lastRemote.palpites.some((p, i) => p !== remoteObj.palpites[i]) ||
        lastRemote.terminou !== remoteObj.terminou ||
        lastRemote.win !== remoteObj.win ||
        lastRemote.tentativas !== remoteObj.tentativas;

      // Se houve alteração local, libera o lock assim que o remoto refletir o local
      if (
        localChangedRef.current &&
        isSameGuesses &&
        isSameWin &&
        isSameFinished
      ) {
        localChangedRef.current = false;
      }

      // Só sobrescreve local se remoto mudou E não houve alteração local desde último sync
      if (
        (!isSameGuesses || !isSameWin || !isSameFinished) &&
        (!localChangedRef.current || isRemoteChanged)
      ) {
        setGuesses(palpitesFirestore.map((p) => parseGuess(p, modo)));
        setInputDigits(["", "", "", ""]);
        if (progresso.terminou) {
          setHasWon(!!progresso.win);
          setHasFinished({ win: !!progresso.win, tries: progresso.tentativas });
        } else {
          setHasWon(false);
          setHasFinished(null);
        }
        lastRemoteProgressRef.current = remoteObj;
        localChangedRef.current = false;
      } else if (isRemoteChanged) {
        // Mesmo se não sobrescrever local, atualiza o ref para o novo remoto
        lastRemoteProgressRef.current = remoteObj;
      }
      return;
    }

    // Só reseta local se NÃO houver progresso salvo para esta rodada/data
    if (guesses.length > 0 || hasWon || hasFinished) {
      setGuesses([]);
      setInputDigits(["", "", "", ""]);
      setHasWon(false);
      setHasFinished(null);
      lastRemoteProgressRef.current = null;
      localChangedRef.current = false;
    }
  }, [rodadaAberta, room, userId]);

  const handleGuess = (guess: string[]) => {
    // [CustomRoomGame] handleGuess
    if (
      !rodadaInfo ||
      !rodadaInfo.rodada ||
      hasWon ||
      hasFinished ||
      guess.some((d) => !d)
    )
      return;
    setGuesses((prev) => {
      const next = [...prev, guess];
      return next;
    });
    setInputDigits(["", "", "", ""]);
    // A verificação de vitória/derrota será feita no useEffect abaixo
  };

  // Salva progresso parcial a cada novo palpite (se não finalizou)
  React.useEffect(() => {
    if (!rodadaInfo) return;
    if (hasFinished) return;
    const lastGuess = guesses[guesses.length - 1];
    if (!lastGuess) return;
    const isCorrect = isGuessCorrect(lastGuess, rodadaInfo.code, rodadaInfo.modo);
    const reachedMaxTries = guesses.length >= (rodadaInfo.maxTries || Infinity);

    if (isCorrect) {
      setHasWon(true);
      setHasFinished({ win: true, tries: guesses.length });
      handleWinCustomRoom(guesses.length, true, guesses);
      return;
    }

    if (reachedMaxTries) {
      setHasFinished({ win: false, tries: guesses.length });
      handleWinCustomRoom(guesses.length, false, guesses);
      return;
    }

    savePartialProgress(guesses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses, rodadaInfo, hasFinished]);

  // Função para salvar progresso parcial (palpites) no Firestore
  async function savePartialProgress(guessesArr: string[][]) {
    if (!room || !rodadaInfo || !rodadaInfo.rodada) return;
    try {
      const progressKey = getCustomRoomProgressKey(room);
      const palpitesSerializados = guessesArr.map((guess) =>
        serializeGuess(guess, rodadaInfo.modo)
      );
      const data = await roomsApi.getRoom(room.id);
      if (!data) return;

      const membros: typeof room.membros = Array.isArray(data.membros)
        ? [...data.membros]
        : [];
      let membroEncontrado = false;
      const membrosAtualizados = membros.map((member) => {
        if (member.id !== userId) return member;
        membroEncontrado = true;
        let progressoRemoto = Array.isArray(member.progresso)
          ? [...member.progresso]
          : [];
        progressoRemoto = removeRoundProgressEntries(
          progressoRemoto,
          rodadaInfo.rodada.rodada,
          room
        );
        progressoRemoto.push({
          rodada: rodadaInfo.rodada.rodada,
          data: progressKey,
          tentativas: guessesArr.length,
          terminou: false,
          win: false,
          palpites: palpitesSerializados,
        });
        return { ...member, progresso: progressoRemoto };
      });

      let membrosFinal = membrosAtualizados;
      if (!membroEncontrado) {
        membrosFinal = [
          ...membrosAtualizados,
          {
            id: userId,
            nome: localStorage.getItem("customRoomUserName") || "Visitante",
            terminouRodada: false,
            tentativas: [],
            progresso: [
              {
                rodada: rodadaInfo.rodada.rodada,
                data: progressKey,
                tentativas: guessesArr.length,
                terminou: false,
                win: false,
                palpites: palpitesSerializados,
              },
            ],
          },
        ];
      }

      await roomsApi.patchRoom(room.id, { membros: membrosFinal });
    } catch {
      // Silencia erro de escrita parcial
    }
  }

  async function handleWinCustomRoom(
    tentativas: number,
    win: boolean,
    palpites: string[][]
  ) {
    if (!room || !rodadaInfo || !rodadaInfo.rodada) return;

    try {
      const progressKey = getCustomRoomProgressKey(room);
      const palpitesSerializados = palpites.map((guess) =>
        serializeGuess(guess, rodadaInfo.modo)
      );

      const data = await roomsApi.getRoom(room.id);
      if (!data) throw new Error("Sala não encontrada");

      const membros: typeof room.membros = Array.isArray(data.membros)
        ? [...data.membros]
        : [];

      let membroEncontrado = false;
      const membrosAtualizados = membros.map((member) => {
        if (member.id !== userId) return member;
        membroEncontrado = true;
        let progressoRemoto = Array.isArray(member.progresso)
          ? [...member.progresso]
          : [];
        progressoRemoto = removeRoundProgressEntries(
          progressoRemoto,
          rodadaInfo.rodada.rodada,
          room
        );
        progressoRemoto.push({
          rodada: rodadaInfo.rodada.rodada,
          data: progressKey,
          tentativas,
          terminou: true,
          win,
          palpites: palpitesSerializados,
        });
        return { ...member, progresso: progressoRemoto };
      });

      let membrosFinal = membrosAtualizados;
      if (!membroEncontrado) {
        membrosFinal = [
          ...membrosAtualizados,
          {
            id: userId,
            nome: localStorage.getItem("customRoomUserName") || "Visitante",
            terminouRodada: false,
            tentativas: [],
            progresso: [
              {
                rodada: rodadaInfo.rodada.rodada,
                data: progressKey,
                tentativas,
                terminou: true,
                win,
                palpites: palpitesSerializados,
              },
            ],
          },
        ];
      }

      await roomsApi.patchRoom(room.id, {
        membros: membrosFinal,
      });

      const roomData = await roomsApi.getRoom(room.id);
      if (!roomData) return;

      const membrosAtual: import("../../types/customRoom").RoomPlayer[] =
        Array.isArray(roomData.membros) ? roomData.membros : [];
      const rodadasConfig: { rodada: number; modo?: string }[] = Array.isArray(
        roomData.rodadas
      )
        ? roomData.rodadas
        : [];

      const ranking = computeRoomRanking(membrosAtual, rodadasConfig, roomData);
      await roomsApi.patchRoom(room.id, { ranking });
    } catch (e: unknown) {
      const err = e as Error;
      alert("Erro ao salvar progresso: " + (err.message || err));
    }
  }

  const completedToday = useMemo(() => {
    if (!player || !room?.rodadas?.length) return 0;

    return room.rodadas.filter((rodada) => {
      const progresso = findRoundProgress(player, rodada.rodada, room);
      return progresso?.terminou;
    }).length;
  }, [player, room]);

  const totalRodadas = room?.rodadas?.length ?? 0;
  const ranking = useMemo(() => {
    if (!room) return [];
    return computeRoomRanking(room.membros, room.rodadas ?? [], room);
  }, [room]);
  const roomAgeDays =
    room?.type === "permanente" && room.criadaEm
      ? getRoomAgeDays(room.criadaEm)
      : null;

  if (renderContent) {
    return <>{renderContent}</>;
  }

  // Corrige erro de lastRodadaInfo: não existe mais, então só usa rodadaInfo
  let painelRodada = null;
  if (
    (rodadaAberta !== null && rodadaInfo && rodadaInfo.rodada) ||
    hasFinished
  ) {
    if (rodadaInfo && rodadaInfo.rodada) {
      painelRodada = (
        <CustomRoomRodadaPainel
          rodadaInfo={rodadaInfo}
          guesses={guesses}
          hasWon={hasWon}
          hasFinished={hasFinished}
          inputDigits={inputDigits}
          setInputDigits={setInputDigits}
          setGuesses={setGuesses}
          handleGuess={handleGuess}
          setRodadaAberta={setRodadaAberta}
          setHasFinished={setHasFinished}
          roomId={roomId}
        />
      );
    }
  }

  return (
    <>
      {painelRodada ? (
        painelRodada
      ) : (
        <div className="custom-create-page">
          <div className="h-16" aria-hidden />

          <main className="relative overflow-hidden pb-12">
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
              <div className="absolute -right-24 top-0 size-[420px] rounded-full bg-brand/6 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 size-[360px] rounded-full bg-success/6 blur-3xl" />
            </div>

            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              <BackButton
                to={roomId ? `/custom/lobby/${roomId}` : "/custom/entrar"}
                className="mb-4"
              />

              <div className="custom-game-hero">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                  Partida
                </span>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {room?.nome}
                </h1>
                <p className="mt-2 text-sm text-white/85">
                  Escolha uma rodada para jogar. Seu progresso fica salvo
                  automaticamente nesta partida.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  <div className="custom-lobby-stat-pill">
                    <span className="custom-lobby-stat-value">
                      {completedToday}/{totalRodadas}
                    </span>
                    <span className="custom-lobby-stat-label">Concluídas</span>
                  </div>
                  <div className="custom-lobby-stat-pill">
                    <span className="custom-lobby-stat-value">{totalRodadas}</span>
                    <span className="custom-lobby-stat-label">Rodadas</span>
                  </div>
                  <div className="custom-lobby-stat-pill">
                    <span className="custom-lobby-stat-value">
                      {room?.membros.length ?? 0}
                    </span>
                    <span className="custom-lobby-stat-label">Jogadores</span>
                  </div>
                  {roomAgeDays !== null && (
                    <div className="custom-lobby-stat-pill">
                      <span className="custom-lobby-stat-value">{roomAgeDays}</span>
                      <span className="custom-lobby-stat-label">Dias ativa</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
                <section className="custom-create-section">
                  <h2 className="custom-create-section-title">Rodadas</h2>
                  <p className="custom-create-section-subtitle">
                    Cada rodada usa o modo configurado na criação da sala.
                  </p>
                  <CustomRoomRounds
                    rodadas={room!.rodadas}
                    player={player}
                    room={room!}
                    setRodadaAberta={setRodadaAberta}
                  />
                </section>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <div className="custom-create-summary">
                    <h2 className="text-lg font-bold text-ink">Ranking</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      Mais pontos = melhor colocação.
                    </p>
                    <div className="mt-4">
                      <CustomRoomRanking
                        ranking={ranking}
                        membros={room!.membros}
                        userId={userId}
                        totalRodadas={totalRodadas}
                        roomType={room!.type}
                        roomCreatedAt={room!.criadaEm}
                        partidaNumero={room!.partidaNumero}
                        rankingPeriodo={room!.rankingPeriodo}
                        rankingResetEm={room!.rankingResetEm}
                      />
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default CustomRoomGame;
