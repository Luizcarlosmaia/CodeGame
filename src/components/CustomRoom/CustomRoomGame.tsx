import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomRoom } from "../../hooks/useCustomRoom";
import { generateDailyCode } from "../../utils/generateDailyCode";
import {
  RankingCard,
  RankingTitle,
  BackButton,
  RoomHeader,
  RoundsTitle,
  MainContainer,
  Card,
} from "./CustomRoomGame.styles";
import CustomRoomRanking from "./CustomRoomRanking";
import { CustomRoomRounds } from "./CustomRoomRounds";
import CustomRoomRodadaPainel from "./CustomRoomRodadaPainel";

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

const CustomRoomGame: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
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
  // Mantém a última rodadaInfo válida enquanto hasFinished estiver preenchido
  const [lastRodadaInfo, setLastRodadaInfo] = useState<typeof rodadaInfo>(null);

  React.useEffect(() => {
    // LOG: Mudança de dependências essenciais

    // [CustomRoomGame] useEffect rodadaAberta/room/userId
    // Sempre limpa tudo se dependências essenciais não existem
    if (
      rodadaAberta === null ||
      !room ||
      !room.id ||
      !room.rodadas ||
      room.rodadas.length === 0
    ) {
      // [CustomRoomGame] Limpando rodadaInfo (rodadaAberta null ou room inválido)
      setRodadaInfo(null);
      setGuesses([]);
      setInputDigits(["", "", "", ""]);
      setHasWon(false);
      // Não limpa hasFinished aqui!
      return;
    }

    type RodadaConfig = { rodada: number; modo?: string; codigo?: string };
    const rodadasConfig: RodadaConfig[] =
      room.rodadas && room.rodadas.length > 0
        ? (room.rodadas as RodadaConfig[])
        : Array.from({ length: 1 }, (_, i) => ({
            rodada: i + 1,
            modo: "casual",
          }));

    const player = room?.membros?.find((m) => m.id === userId);

    const rodadaIdx = rodadasConfig.findIndex((r) => r.rodada === rodadaAberta);
    const rodada = rodadasConfig[rodadaIdx];
    if (!rodada) {
      setRodadaInfo(null);
      setGuesses([]);
      setInputDigits(["", "", "", ""]);
      setHasWon(false);
      // Não limpa hasFinished aqui!
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
    // Define limite de tentativas por modo
    let maxTries = 10;
    if (modo === "casual") maxTries = 6;
    else if (modo === "desafio") maxTries = 15;
    const info = { rodadaIdx, rodada, modo, code, maxTries };
    setRodadaInfo(info);
    setLastRodadaInfo(info);

    // [CustomRoomGame] setRodadaInfo

    // Busca progresso do jogador nesta rodada e data
    const dataHoje = todayKey();
    const progresso = player?.progresso?.find(
      (p) => p.rodada === rodada.rodada && p.data === dataHoje
    );
    if (progresso && progresso.terminou) {
      setHasWon(!!progresso.win);
      setHasFinished({
        win: !!progresso.win,
        tries: progresso.tentativas,
      });
    } else {
      setHasWon(false);
      setHasFinished(null);
    }
    setGuesses([]);
    setInputDigits(["", "", "", ""]);
  }, [rodadaAberta, room, userId]);

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
    // Define limite de tentativas por modo
    let maxTries = 10;
    if (modo === "casual") maxTries = 6;
    else if (modo === "desafio") maxTries = 15;
    setRodadaInfo({ rodadaIdx, rodada, modo, code, maxTries });

    const dataHoje = todayKey();
    const progresso = player?.progresso?.find(
      (p) => p.rodada === rodada.rodada && p.data === dataHoje
    );
    if (progresso && progresso.terminou) {
      setHasWon(true);
    } else {
      setHasWon(false);
    }
    setGuesses([]);
    setInputDigits(["", "", "", ""]);
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

  // Novo useEffect para controlar vitória/derrota após guesses mudar
  React.useEffect(() => {
    // [CustomRoomGame] useEffect guesses
    if (!rodadaInfo) return;
    if (hasFinished) return;
    const lastGuess = guesses[guesses.length - 1];
    if (!lastGuess) return;
    const isCorrect = lastGuess.join("") === rodadaInfo.code.join("");

    // [CustomRoomGame] Novo palpite
    if (isCorrect) {
      setHasWon(true);
      setHasFinished({ win: true, tries: guesses.length });

      // [CustomRoomGame] Vitória detectada
      handleWinCustomRoom(guesses.length, true, guesses);
    } else if (guesses.length >= (rodadaInfo.maxTries || Infinity)) {
      setHasFinished({ win: false, tries: guesses.length });

      // [CustomRoomGame] Derrota detectada
      handleWinCustomRoom(guesses.length, false, guesses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses, rodadaInfo, hasFinished]);

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
        let progresso = Array.isArray(m.progresso) ? [...m.progresso] : [];
        progresso = progresso.filter(
          (p) => !(p.rodada === rodadaInfo.rodada.rodada && p.data === dataHoje)
        );
        progresso.push({
          rodada: rodadaInfo.rodada.rodada,
          data: dataHoje,
          tentativas,
          terminou: true,
          win,
          palpites: palpitesSerializados,
        });
        return { ...m, progresso };
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
      await updateDoc(ref, { membros: membrosFinal });

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

  let painelRodada = null;
  // Exibe o painel da rodada enquanto hasFinished estiver preenchido, mesmo que rodadaAberta seja null
  // Usa a última rodadaInfo válida para garantir que o overlay tenha contexto
  if (
    (rodadaAberta !== null && rodadaInfo && rodadaInfo.rodada) ||
    hasFinished
  ) {
    const infoToUse =
      rodadaInfo && rodadaInfo.rodada ? rodadaInfo : lastRodadaInfo;

    console.log("[CustomRoomGame] Render painelRodada", {
      rodadaAberta,
      rodadaInfo,
      lastRodadaInfo,
      hasFinished,
      infoToUse,
    });
    if (infoToUse) {
      painelRodada = (
        <CustomRoomRodadaPainel
          rodadaInfo={infoToUse}
          guesses={guesses}
          hasWon={hasWon}
          hasFinished={hasFinished}
          inputDigits={inputDigits}
          setInputDigits={setInputDigits}
          setGuesses={setGuesses}
          handleGuess={handleGuess}
          setRodadaAberta={setRodadaAberta}
          setHasFinished={setHasFinished}
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
          <Card>
            <BackButton onClick={() => navigate(`/custom/lobby/${roomId}`)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ marginRight: 2 }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 15L8 10.5L12.5 6"
                  stroke="#1976d2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Voltar
            </BackButton>
            <RoomHeader>{room?.nome}</RoomHeader>
            <RoundsTitle>Rodadas</RoundsTitle>
            {/* Lista de rodadas extraída para componente */}
            <CustomRoomRounds
              rodadas={room!.rodadas}
              player={player}
              setRodadaAberta={setRodadaAberta}
            />
            {/* Ranking */}
            <RankingCard>
              <RankingTitle>Ranking</RankingTitle>
              <CustomRoomRanking
                ranking={room!.ranking}
                membros={room!.membros}
                userId={userId}
              />
            </RankingCard>
          </Card>
        </MainContainer>
      )}
    </>
  );
};

export default CustomRoomGame;
