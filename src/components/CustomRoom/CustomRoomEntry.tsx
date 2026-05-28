import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PrimaryButton from "../PrimaryButton";
import BackButton from "../BackButton";
import { cn } from "../../lib/cn";
import { getModeLabel } from "../../utils/modeLabels";
import { fetchMyCustomRooms } from "../../utils/customRoomStorage";
interface Props {
  onCreate: (data: {
    nome: string;
    modos: { modo: string; rodadas: number }[];
    type: "permanente";
  }) => void;
  onJoin: (roomId: string) => Promise<"already_joined" | false | true | void>;
  forceTab?: "criar" | "entrar" | "permanentes";
  hideTabs?: boolean;
}

const CustomRoomEntry: React.FC<Props & { creating?: boolean }> = ({
  onJoin,
  forceTab,
  hideTabs,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab sempre derivada da query string, exceto se forçado
  function getTabFromQuery() {
    if (forceTab) return forceTab;
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "permanentes") return "permanentes";
    if (tabParam === "entrar") return "entrar";
    return "criar";
  }
  const tab = getTabFromQuery();

  const [, setNome] = useState("");
  const [userName, setUserName] = useState(
    () => localStorage.getItem("customRoomUserName") || ""
  );
  const [, setSelectedModes] = useState<{
    [modo: string]: number;
  }>({});
  const [joinId, setJoinId] = useState("");
  type PermanentRoom = {
    id: string;
    nome: string;
    modos?: { modo: string; rodadas: number }[];
  };
  const [permanentRooms, setPermanentRooms] = useState<PermanentRoom[]>([]);
  const [loadingPermanent, setLoadingPermanent] = useState(false);
  const [error, setError] = useState<string>("");
  const [shakeInput, setShakeInput] = useState<string | null>(null);
  const joinInputRef = React.useRef<HTMLInputElement>(null);

  // Limpa campos ao trocar de aba
  useEffect(() => {
    setNome("");
    setSelectedModes({});
    setJoinId("");
    setError("");
  }, [tab]);

  // Carrega salas permanentes tanto na aba "permanentes" quanto na tela de entrada dedicada
  useEffect(() => {
    if (tab === "permanentes" || (tab === "entrar" && hideTabs)) {
      setLoadingPermanent(true);
      const fetchRooms = async () => {
        try {
          const rooms = await fetchMyCustomRooms();
          setPermanentRooms(
            rooms.map((room) => ({
              id: room.id,
              nome: room.nome || "",
              modos: room.modos || [],
            }))
          );
        } catch {
          setPermanentRooms([]);
        } finally {
          setLoadingPermanent(false);
        }
      };
      fetchRooms();
    }
  }, [tab, hideTabs]);

  useEffect(() => {
    if (tab === "entrar" && joinInputRef.current) {
      joinInputRef.current.focus();
    }
    setError(""); // Limpa erro ao trocar de aba
  }, [tab]);

  return (
    <div className="mt-10 flex w-full max-w-[900px] flex-col items-center rounded-[18px] bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
      <div className="flex w-full max-w-[1500px] flex-wrap items-start justify-center gap-8 px-4 py-4 md:gap-20 md:px-8">
        <div className="w-full min-w-[280px] max-w-md flex-1">
          <div className="mb-2 mt-4">
            <BackButton to="/home" />
          </div>
          <section className="flex w-full flex-col gap-2 rounded-[14px] bg-surface p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] sm:p-6">
            <label className="input-label">
              Código da sala <span className="text-[#d32f2f]">*</span>
            </label>
            <input
              ref={joinInputRef}
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Código da sala"
              maxLength={32}
              className={cn(
                "input-field mb-3",
                shakeInput === "joinId" && !!error && "shake-anim"
              )}
            />
            <label className="input-label mt-3">
              Seu nome <span className="text-[#d32f2f]">*</span>
            </label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={24}
              className={cn(
                "input-field mb-3",
                shakeInput === "userName" && !!error && "shake-anim"
              )}
            />
            <PrimaryButton
              className="mt-3"
              onClick={async () => {
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
                  // onJoin agora pode retornar erro
                  const joinResult = await onJoin(joinId.trim());
                  if (joinResult === "already_joined") {
                    setError("Você já está participando desta sala.");
                    setShakeInput("joinId");
                    vibrate = true;
                    return;
                  }
                  if (joinResult === false) {
                    setError("Erro ao entrar na sala. Tente novamente.");
                    setShakeInput("joinId");
                    vibrate = true;
                    return;
                  }
                }
                if (vibrate) {
                  if (window.navigator.vibrate) window.navigator.vibrate(120);
                  setTimeout(() => setShakeInput(null), 350);
                }
              }}
            >
              Entrar
            </PrimaryButton>
            {error && (
              <p className="mt-2 text-[15px] font-medium text-[#d32f2f]">
                {error}
              </p>
            )}
          </section>
        </div>

        <div className="w-full min-w-[280px] max-w-xl flex-[1.2]">
          <section className="flex w-full flex-col gap-2">
            <label className="input-label">Salas que já sou membro:</label>
            {loadingPermanent && <div>Carregando...</div>}
            {!loadingPermanent && permanentRooms.length === 0 && (
              <div className="text-ink-muted">
                Nenhuma sala ativa disponível.
              </div>
            )}
            <ul className="m-0 list-none p-0">
              {permanentRooms.map((room) => (
                <li
                  key={room.id}
                  className="mb-2.5 flex flex-col gap-1.5 rounded-[14px] bg-[#fafdff] p-4 shadow-[0_2px_10px_rgba(25,118,210,0.06)] transition-shadow hover:bg-[#f1f7fb] hover:shadow-[0_4px_18px_rgba(25,118,210,0.13)] sm:gap-4"
                >
                  <div>
                    <div className="flex w-full items-center justify-between">
                      <b>{room.nome}</b>
                      <span className="ml-1 text-[0.73em] font-semibold text-[#b0b8c9]">
                        [{room.id}]
                      </span>
                    </div>
                    <div className="mt-0.5 text-[0.93rem] text-[#7a8ca3]">
                      {Array.isArray(room.modos) && room.modos.length > 0 ? (
                        room.modos.map(
                          (m: { modo: string; rodadas: number }) => (
                            <span
                              key={m.modo}
                              className="m-0.5 inline-block rounded-md border border-[#e0e4ea] px-1 py-0.5 text-[0.73em] font-normal text-[#7a8ca3]"
                            >
                              {getModeLabel(m.modo)} · {m.rodadas} rodada
                              {m.rodadas === 1 ? "" : "s"}
                            </span>
                          )
                        )
                      ) : (
                        <span className="font-medium text-[#b0b8c9]">-</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/custom/lobby/${room.id}`)}
                    className="mt-1 w-full cursor-pointer rounded-md border-0 bg-[#e3eaf5] py-2.5 text-base font-bold text-brand transition-colors hover:bg-[#d6e3f7] hover:text-[#1251a3]"
                  >
                    Entrar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CustomRoomEntry;
