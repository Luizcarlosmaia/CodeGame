import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import { generateDailyCode } from "../../utils/generateDailyCode";
import {
  RankingCard,
  RankingTitle,
  RoomHeader,
  MainContainer,
  Card,
  GameMainWrapper,
  GameLeftCol,
  GameRightCol,
} from "./CustomRoomGame.styles";
import BackButton from "../BackButton";
import CustomRoomRanking from "./CustomRoomRanking";
import { CustomRoomRounds } from "./CustomRoomRounds";
import CustomRoomRodadaPainel from "./CustomRoomRodadaPainel";

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

const CustomRoomGame: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [rodadaAberta, setRodadaAberta] = useState<number | null>(null);

  const userId = useMemo(() => {
    if (!roomId) return "";
    return localStorage.getItem(`customRoomUserId_${roomId}`) || "";
  }, [roomId]);

  const { room, loading, error } = useCustomRoom(roomId);

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

  const { joinRoom } = useCustomRoom(roomId);
  const [joining, setJoining] = useState(false);
  const [joinTried, setJoinTried] = useState(false);
  let renderContent: React.ReactNode = null;

  const player =
    room && room.membros
      ? room.membros.find((m) => m.id === userId)
      : undefined;

  React.useEffect(() => {
    if (
      room &&
      userId &&
      !player &&
      !joining &&
      !joinTried &&
      Array.isArray(room.membros)
    ) {
      setJoining(true);
      joinRoom(roomId!, {
        id: userId,
        nome: localStorage.getItem("customRoomUserName") || "Visitante",
        terminouRodada: false,
        tentativas: [],
        progresso: [],
      }).finally(() => {
        setJoining(false);
        setJoinTried(true);
      });
    }
  }, [room, userId, player, joining, joinTried, roomId, joinRoom]);

  if (loading || joining) {
    renderContent = <div>Carregando sala...</div>;
  } else if (error) {
    renderContent = <div style={{ color: "#d32f2f" }}>{error}</div>;
  } else if (!room) {
    renderContent = (
      <div style={{ color: "#d32f2f" }}>Sala não encontrada.</div>
    );
  } else if (!room.type || room.type !== "permanente") {
    renderContent = <div>Este fluxo é apenas para salas fixas.</div>;
  } else if (!player) {
    renderContent = (
      <div style={{ color: "#d32f2f", textAlign: "center", margin: "32px 0" }}>
        Adicionando você como membro da sala...
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

    const allowedModes = ["casual", "desafio", "custom"] as const;
    function isAllowedMode(m: unknown): m is (typeof allowedModes)[number] {
      return (
        typeof m === "string" && (allowedModes as readonly string[]).includes(m)
      );
    }
    const modo = isAllowedMode(rodada.modo) ? rodada.modo : "casual";
    const code = rodada.codigo
      ? rodada.codigo.split("")
      : generateDailyCode(
          `${todayKey()}-${room.id}-rodada${rodada.rodada}-modo${modo}`
        );
    let maxTries = 10;
    if (modo === "casual") maxTries = 6;
    else if (modo === "desafio") maxTries = 15;
    setRodadaInfo({ rodadaIdx, rodada, modo, code, maxTries });

    // --- RESTAURA PROGRESSO DO FIRESTORE DE FORMA ROBUSTA ---
    const dataHoje = todayKey();
    // Sempre prioriza progresso finalizado, se houver mais de um para a rodada/data
    const progressoList =
      player?.progresso?.filter(
        (p) => p.rodada === rodada.rodada && p.data === dataHoje
      ) || [];
    const progresso = progressoList.find((p) => p.terminou) || progressoList[0];
    if (progresso) {
      const palpitesFirestore = Array.isArray(progresso.palpites)
        ? progresso.palpites
        : [];
      const palpitesLocal = guesses.map((g) => g.join(""));
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
        setGuesses(palpitesFirestore.map((p) => p.split("")));
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
    const isCorrect = lastGuess.join("") === rodadaInfo.code.join("");

    // Salva progresso parcial no Firestore
    savePartialProgress(guesses);

    // [CustomRoomGame] Novo palpite
    if (isCorrect) {
      setHasWon(true);
      setHasFinished({ win: true, tries: guesses.length });
      handleWinCustomRoom(guesses.length, true, guesses);
    } else if (guesses.length >= (rodadaInfo.maxTries || Infinity)) {
      setHasFinished({ win: false, tries: guesses.length });
      handleWinCustomRoom(guesses.length, false, guesses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses, rodadaInfo, hasFinished]);

  // Função para salvar progresso parcial (palpites) no Firestore
  async function savePartialProgress(guessesArr: string[][]) {
    if (!room || !rodadaInfo || !rodadaInfo.rodada) return;
    try {
      const { doc, updateDoc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../../firebase");
      const ref = doc(db, "rooms", room.id);
      const dataHoje = todayKey();
      const palpitesSerializados = guessesArr.map((p) => p.join(""));
      // Busca o progresso mais recente do Firestore antes de salvar
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      const membros: typeof room.membros = Array.isArray(data.membros)
        ? [...data.membros]
        : [];
      let membroEncontrado = false;
      const membrosAtualizados = membros.map((m) => {
        if (m.id !== userId) return m;
        membroEncontrado = true;
        let progressoRemoto = Array.isArray(m.progresso)
          ? [...m.progresso]
          : [];
        // Remove progresso duplicado do mesmo dia/rodada
        progressoRemoto = progressoRemoto.filter(
          (p) => !(p.rodada === rodadaInfo.rodada.rodada && p.data === dataHoje)
        );
        // Adiciona o progresso parcial
        progressoRemoto.push({
          rodada: rodadaInfo.rodada.rodada,
          data: dataHoje,
          tentativas: guessesArr.length,
          terminou: false,
          win: false,
          palpites: palpitesSerializados,
        });
        return { ...m, progresso: progressoRemoto };
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
                data: dataHoje,
                tentativas: guessesArr.length,
                terminou: false,
                win: false,
                palpites: palpitesSerializados,
              },
            ],
          },
        ];
      }
      await updateDoc(ref, { membros: membrosFinal });
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
      const { doc, updateDoc, getDoc } = await import("firebase/firestore");
      const { db } = await import("../../firebase");
      const ref = doc(db, "rooms", room.id);
      const dataHoje = todayKey();
      const palpitesSerializados = palpites.map((p) => p.join(""));

      // Busca o progresso mais recente do Firestore antes de salvar
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Sala não encontrada");
      const data = snap.data();
      const membros: typeof room.membros = Array.isArray(data.membros)
        ? [...data.membros]
        : [];

      let membroEncontrado = false;
      const membrosAtualizados = membros.map((m) => {
        if (m.id !== userId) return m;
        membroEncontrado = true;
        let progressoRemoto = Array.isArray(m.progresso)
          ? [...m.progresso]
          : [];
        // Remove progresso duplicado do mesmo dia/rodada
        progressoRemoto = progressoRemoto.filter(
          (p) => !(p.rodada === rodadaInfo.rodada.rodada && p.data === dataHoje)
        );
        // Adiciona o progresso atual
        progressoRemoto.push({
          rodada: rodadaInfo.rodada.rodada,
          data: dataHoje,
          tentativas,
          terminou: true,
          win,
          palpites: palpitesSerializados,
        });
        return { ...m, progresso: progressoRemoto };
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
                data: dataHoje,
                tentativas,
                terminou: true,
                win,
                palpites: palpitesSerializados,
              },
            ],
          },
        ];
      }

      // Atualiza o campo 'codigo' da rodada correspondente no array 'rodadas'
      // Recupera rodadas atuais do snapshot
      const rodadasAtualizadas = Array.isArray(data.rodadas)
        ? [...data.rodadas]
        : [];
      const rodadaIdxToUpdate = rodadasAtualizadas.findIndex(
        (r) => r.rodada === rodadaInfo.rodada.rodada
      );
      if (rodadaIdxToUpdate !== -1) {
        // Atualiza o campo codigo apenas se estiver vazio ou diferente
        const codigoCorreto = rodadaInfo.code.join("");
        if (rodadasAtualizadas[rodadaIdxToUpdate].codigo !== codigoCorreto) {
          rodadasAtualizadas[rodadaIdxToUpdate] = {
            ...rodadasAtualizadas[rodadaIdxToUpdate],
            codigo: codigoCorreto,
          };
        }
      }

      await updateDoc(ref, {
        membros: membrosFinal,
        rodadas: rodadasAtualizadas,
      });

      const roomSnap = await getDoc(ref);
      if (!roomSnap.exists()) return;
      const roomData = roomSnap.data();
      const membrosAtual: import("../../types/customRoom").RoomPlayer[] =
        Array.isArray(roomData.membros) ? roomData.membros : [];
      const rodadasConfig: { rodada: number; modo?: string }[] = Array.isArray(
        roomData.rodadas
      )
        ? roomData.rodadas
        : [];
      const pontosPorModo: Record<string, number> = { casual: 6, desafio: 15 };
      const today = todayKey();

      const ranking = membrosAtual.map((m) => {
        let pontos = 0;

        rodadasConfig.forEach((rodada) => {
          const modo = rodada.modo || "casual";
          const maxPontos = pontosPorModo[modo] || 15;

          const progressoRodada = Array.isArray(m.progresso)
            ? m.progresso.filter((p) => p.rodada === rodada.rodada)
            : [];

          let datasRodada: string[] = [];
          membrosAtual.forEach((m2) => {
            if (Array.isArray(m2.progresso)) {
              m2.progresso.forEach((p) => {
                if (
                  p.rodada === rodada.rodada &&
                  !datasRodada.includes(p.data)
                ) {
                  datasRodada.push(p.data);
                }
              });
            }
          });

          datasRodada = datasRodada.filter((d) => d <= today).sort();

          datasRodada.forEach((data) => {
            if (data === today) {
              const progHoje = progressoRodada.find(
                (p) => p.data === today && p.terminou
              );
              if (progHoje) {
                pontos += progHoje.tentativas;
              }
            } else {
              const progDia = progressoRodada.find(
                (p) => p.data === data && p.terminou
              );
              if (progDia) {
                pontos += progDia.tentativas;
              } else {
                pontos += maxPontos;
              }
            }
          });
        });
        return {
          playerId: m.id,
          nome: m.nome,
          pontos,
        };
      });

      ranking.sort((a, b) => a.pontos - b.pontos);
      await updateDoc(ref, { ranking });
    } catch (e: unknown) {
      const err = e as Error;
      alert("Erro ao salvar progresso: " + (err.message || err));
    }
  }

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
        <MainContainer>
          <Card style={{ padding: 0 }}>
            <BackButton to={roomId ? `/custom/lobby/${roomId}` : "/desafios"} />
            <RoomHeader>{room?.nome}</RoomHeader>
            <GameMainWrapper>
              <GameLeftCol>
                <CustomRoomRounds
                  rodadas={room!.rodadas}
                  player={player}
                  setRodadaAberta={setRodadaAberta}
                />
              </GameLeftCol>
              <GameRightCol>
                <RankingCard style={{ marginTop: 0 }}>
                  <RankingTitle>Ranking</RankingTitle>
                  <CustomRoomRanking
                    ranking={room!.ranking}
                    membros={room!.membros}
                    userId={userId}
                    totalRodadas={room!.rodadas.length}
                  />
                </RankingCard>
              </GameRightCol>
            </GameMainWrapper>
          </Card>
        </MainContainer>
      )}
    </>
  );
};

export default CustomRoomGame;
