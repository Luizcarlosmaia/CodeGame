import { screen, fireEvent, waitFor, render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CustomRoomGame from "./CustomRoomGame";
import * as useCustomRoomHook from "../../hooks/useCustomRoom";
import { createUseCustomRoomMock } from "../../test/mockUseCustomRoom";
import { roomsApi } from "../../api/roomsApi";
import { getCustomRoomDailyCode } from "../../utils/customRoomDailyCode";
import { vi } from "vitest";
import type { CustomRoom } from "../../types/customRoom";

const winningGuessRodada1 = getCustomRoomDailyCode("sala1", 1, "casual");

vi.mock("../../api/roomsApi", () => ({
  roomsApi: {
    getRoom: vi.fn(),
    patchRoom: vi.fn(),
  },
}));

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
  rodadas: [{ rodada: 1, modo: "casual", codigo: "1234", encerrada: false, inicio: "" }],
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

describe("CustomRoomGame - integração vitória/derrota", () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "customRoomUserId_sala1") return "user1";
      if (key === "customRoomUserName") return "Jogador 1";
      return null;
    });
    vi.mocked(roomsApi.getRoom).mockResolvedValue(baseRoom);
    vi.mocked(roomsApi.patchRoom).mockResolvedValue({ ok: true });
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockReturnValue(
      createUseCustomRoomMock(baseRoom)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exibe overlay de vitória ao acertar o código", async () => {
    renderGame();
    fireEvent.click(await screen.findByTestId("play-round-1"));
    submitGuess(winningGuessRodada1);
    expect(
      await screen.findByText(/vitória!/i, undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it("exibe overlay de derrota ao esgotar tentativas", async () => {
    renderGame();
    fireEvent.click(await screen.findByTestId("play-round-1"));

    for (let i = 0; i < 6; i++) {
      submitGuess(["9", "9", "9", "9"]);
    }

    expect(
      await screen.findByText(/rodada encerrada/i, undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it("mantém o progresso do usuário após jogar e recarregar", async () => {
    const roomWithTwoRounds: CustomRoom = {
      ...baseRoom,
      rodadas: [
        { rodada: 1, modo: "casual", codigo: "1234", encerrada: false, inicio: "" },
        { rodada: 2, modo: "casual", codigo: "5678", encerrada: false, inicio: "" },
      ],
    };

    let currentRoom = JSON.parse(JSON.stringify(roomWithTwoRounds)) as CustomRoom;

    vi.mocked(roomsApi.getRoom).mockImplementation(async () => currentRoom);
    vi.mocked(roomsApi.patchRoom).mockImplementation(async (_id, patch) => {
      if (patch.membros) {
        currentRoom = { ...currentRoom, membros: patch.membros };
      }
      if (patch.ranking) {
        currentRoom = { ...currentRoom, ranking: patch.ranking };
      }
      vi.mocked(roomsApi.getRoom).mockImplementation(async () => currentRoom);
      return { ok: true };
    });
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockImplementation(() =>
      createUseCustomRoomMock(currentRoom, {
        setRoom: (value: CustomRoom | null | ((prev: CustomRoom | null) => CustomRoom | null)) => {
          if (typeof value === "function") {
            currentRoom = value(currentRoom) ?? currentRoom;
          } else if (value) {
            currentRoom = value;
          }
          vi.mocked(roomsApi.getRoom).mockImplementation(async () => currentRoom);
        },
      })
    );

    renderGame();
    fireEvent.click(await screen.findByTestId("play-round-1"));
    submitGuess(winningGuessRodada1);
    await screen.findByText(/vitória!/i, undefined, { timeout: 5000 });
    await waitFor(() => {
      expect(currentRoom.membros[0]?.progresso?.some((p) => p.terminou && p.win)).toBe(
        true
      );
    });

    renderGame();
    await waitFor(() => {
      expect(screen.getByText(/rodada 1/i).closest("article")).toHaveTextContent(
        /vitória/i
      );
    });
  });
});
