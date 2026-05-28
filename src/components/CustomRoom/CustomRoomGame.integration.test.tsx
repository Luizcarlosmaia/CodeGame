import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../test-utils";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CustomRoomGame from "./CustomRoomGame";
import * as useCustomRoomHook from "../../hooks/useCustomRoom";
import { createUseCustomRoomMock } from "../../test/mockUseCustomRoom";
import { vi } from "vitest";
import type { CustomRoom } from "../../types/customRoom";

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

describe("CustomRoomGame - integração vitória/derrota", () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "customRoomUserId_sala1") return "user1";
      if (key === "customRoomUserName") return "Jogador 1";
      return null;
    });
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockReturnValue(
      createUseCustomRoomMock(baseRoom)
    );
  });

  it("exibe overlay de vitória ao acertar o código", async () => {
    renderGame();
    fireEvent.click(await screen.findByTestId("play-round-1"));
    submitGuess(["1", "2", "3", "4"]);
    expect(await screen.findByText(/vitória!/i)).toBeInTheDocument();
  });

  it("exibe overlay de derrota ao esgotar tentativas", async () => {
    renderGame();
    fireEvent.click(await screen.findByTestId("play-round-1"));

    for (let i = 0; i < 6; i++) {
      submitGuess(["9", "9", "9", "9"]);
    }

    expect(await screen.findByText(/rodada encerrada/i)).toBeInTheDocument();
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

    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockImplementation(() =>
      createUseCustomRoomMock(currentRoom, {
        setRoom: (value) => {
          if (typeof value === "function") {
            currentRoom = value(currentRoom) ?? currentRoom;
          } else if (value) {
            currentRoom = value;
          }
        },
      })
    );

    renderGame();
    fireEvent.click(await screen.findByTestId("play-round-1"));
    submitGuess(["1", "2", "3", "4"]);
    await screen.findByText(/vitória!/i);

    renderGame();
    expect(screen.getByText(/rodada 1/i).closest("article")).toHaveTextContent(/vitória/i);
  });
});
