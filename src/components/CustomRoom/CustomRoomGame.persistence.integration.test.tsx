import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { renderWithTheme } from "../../test-utils";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CustomRoomGame from "./CustomRoomGame";
import * as useCustomRoomHook from "../../hooks/useCustomRoom";
import { createUseCustomRoomMock } from "../../test/mockUseCustomRoom";
import { vi } from "vitest";
import type { CustomRoom, RoomPlayer } from "../../types/customRoom";

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
  return renderWithTheme(
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

  beforeEach(() => {
    progressoPersistente = [];
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === "customRoomUserId_sala1") return "user1";
      if (key === "customRoomUserName") return "Jogador 1";
      return null;
    });
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockImplementation(() => {
      const room = JSON.parse(JSON.stringify(baseRoom)) as CustomRoom;
      room.membros[0].progresso = progressoPersistente;

      return createUseCustomRoomMock(room, {
        setRoom: (value) => {
          let updated: CustomRoom | null;
          if (typeof value === "function") {
            updated = value(room);
          } else {
            updated = value;
          }
          if (updated?.membros?.[0]?.progresso) {
            progressoPersistente = updated.membros[0].progresso;
          }
        },
      });
    });
  });

  it("mantém o progresso do usuário após várias jogadas e reloads", async () => {
    renderGame();

    fireEvent.click(screen.getByTestId("play-round-1"));
    submitGuess(["1", "2", "3", "4"]);
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
      submitGuess(["0", "0", "0", "0"]);
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
