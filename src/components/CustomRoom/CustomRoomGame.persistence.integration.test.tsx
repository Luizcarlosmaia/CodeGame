import { screen, fireEvent, waitFor, within, render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CustomRoomGame from "./CustomRoomGame";
import * as useCustomRoomHook from "../../hooks/useCustomRoom";
import { createUseCustomRoomMock } from "../../test/mockUseCustomRoom";
import { roomsApi } from "../../api/roomsApi";
import { getCustomRoomDailyCode } from "../../utils/customRoomDailyCode";
import { vi } from "vitest";
import type { CustomRoom, RoomPlayer } from "../../types/customRoom";

vi.mock("../../api/roomsApi", () => ({
  roomsApi: {
    getRoom: vi.fn(),
    patchRoom: vi.fn(),
  },
}));

const winningGuessRodada1 = getCustomRoomDailyCode("sala1", 1, "casual");
const winningGuessRodada2 = getCustomRoomDailyCode("sala1", 2, "casual");

const baseRoom: CustomRoom = {
  id: "sala1",
  nome: "Sala Teste",
  type: "permanente",
  ownerId: "user1",
  admins: ["user1"],
  membros: [
    {
      id: "user1",
      nome: "Jogador 1",
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    },
  ],
  modo: "casual",
  rodadaAtual: 1,
  rodadas: [
    { rodada: 1, modo: "casual", codigo: "1234", encerrada: false, inicio: "" },
    { rodada: 2, modo: "casual", codigo: "5678", encerrada: false, inicio: "" },
  ],
  ranking: [],
  aberta: true,
  criadaEm: new Date().toISOString(),
};

function renderGame() {
  return render(
    <MemoryRouter initialEntries={["/custom/game/sala1"]}>
      <Routes>
        <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
      </Routes>
    </MemoryRouter>
  );
}

function submitGuess(digits: string[]) {
  const inputs = screen.getAllByRole("textbox");
  digits.forEach((digit, index) => {
    fireEvent.change(inputs[index], { target: { value: digit } });
  });
  fireEvent.click(screen.getByRole("button", { name: /enviar palpite/i }));
}

describe("CustomRoomGame - persistência de progresso", () => {
  let progressoPersistente: RoomPlayer["progresso"] = [];
  let stableRoom: CustomRoom;

  beforeEach(() => {
    progressoPersistente = [];
    stableRoom = JSON.parse(JSON.stringify(baseRoom)) as CustomRoom;
    stableRoom.membros[0].progresso = progressoPersistente;

    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === "customRoomUserId_sala1") return "user1";
      if (key === "customRoomUserName") return "Jogador 1";
      return null;
    });
    vi.mocked(roomsApi.getRoom).mockImplementation(async () => stableRoom);
    vi.mocked(roomsApi.patchRoom).mockImplementation(async (_id, patch) => {
      if (patch.membros) {
        stableRoom = { ...stableRoom, membros: patch.membros };
        progressoPersistente = stableRoom.membros[0]?.progresso ?? [];
      }
      if (patch.ranking) {
        stableRoom = { ...stableRoom, ranking: patch.ranking };
      }
      return { ok: true };
    });
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockImplementation(() =>
      createUseCustomRoomMock(stableRoom, {
        setRoom: (value: CustomRoom | null | ((prev: CustomRoom | null) => CustomRoom | null)) => {
          if (typeof value === "function") {
            stableRoom = value(stableRoom) ?? stableRoom;
          } else if (value) {
            stableRoom = value;
          }
          if (stableRoom.membros[0]?.progresso) {
            progressoPersistente = stableRoom.membros[0].progresso;
          }
        },
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mantém o progresso do usuário após várias jogadas e reloads", async () => {
    renderGame();

    fireEvent.click(screen.getByTestId("play-round-1"));
    submitGuess(winningGuessRodada1);
    await waitFor(() => {
      expect(screen.getByText(/vitória!/i)).toBeInTheDocument();
    });

    renderGame();
    const roundCard1 = screen.getByText(/rodada 1/i).closest("article");
    expect(roundCard1).not.toBeNull();
    if (roundCard1) {
      expect(within(roundCard1).getByText(/vitória/i)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByTestId("play-round-2"));
    for (let i = 0; i < 6; i++) {
      submitGuess(
        winningGuessRodada2.map((digit) => (digit === "9" ? "0" : "9"))
      );
    }
    await waitFor(() => {
      expect(screen.getByText(/rodada encerrada/i)).toBeInTheDocument();
    });

    renderGame();
    const roundCard2 = screen.getByText(/rodada 2/i).closest("article");
    expect(roundCard2).not.toBeNull();
    if (roundCard2) {
      expect(within(roundCard2).getByText(/concluída/i)).toBeInTheDocument();
    }
  });
});
