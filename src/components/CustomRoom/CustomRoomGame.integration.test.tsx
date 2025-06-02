import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../test-utils";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CustomRoomGame from "./CustomRoomGame";
import * as useCustomRoomHook from "../../hooks/useCustomRoom";
import { vi } from "vitest";

// Mock do hook para simular sala custom
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
  modo: "custom",
  rodadaAtual: 1,
  rodadas: [{ rodada: 1, codigo: "1234", encerrada: false, inicio: "" }],
  ranking: [],
  aberta: true,
  criadaEm: new Date().toISOString(),
};

describe("CustomRoomGame - integração vitória/derrota", () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "customRoomUserId_sala1") return "user1";
      if (key === "customRoomUserName") return "Jogador 1";
      return null;
    });
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockReturnValue({
      room: baseRoom,
      setRoom: () => {},
      loading: false,
      error: null,
      createRoom: async () => null,
      joinRoom: async () => true,
      leaveRoom: async () => true,
      deleteRoom: async () => true,
    });
  });

  it("exibe overlay de vitória ao acertar o código", async () => {
    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );
    // Espera o botão aparecer e abre a rodada
    const playButtons = await screen.findAllByText(/jogar rodada/i);
    fireEvent.click(playButtons[0]);
    // Digitar código correto
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.change(inputs[1], { target: { value: "2" } });
    fireEvent.change(inputs[2], { target: { value: "3" } });
    fireEvent.change(inputs[3], { target: { value: "4" } });
    fireEvent.click(screen.getByText(/enviar/i));
    await screen.findByText(/você ganhou!/i);
    expect(screen.getByText(/você ganhou!/i)).toBeInTheDocument();
  });

  it("exibe overlay de derrota ao errar 10 vezes", async () => {
    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );
    const playButton = await screen.findByText(/jogar rodada/i);
    fireEvent.click(playButton);
    const inputs = screen.getAllByRole("textbox");
    for (let i = 0; i < 10; i++) {
      fireEvent.change(inputs[0], { target: { value: "9" } });
      fireEvent.change(inputs[1], { target: { value: "9" } });
      fireEvent.change(inputs[2], { target: { value: "9" } });
      fireEvent.change(inputs[3], { target: { value: "9" } });
      fireEvent.click(screen.getByText(/enviar/i));
    }
    await screen.findByText(/você perdeu!/i);
    expect(screen.getByText(/você perdeu!/i)).toBeInTheDocument();
  });
  it("mantém o progresso do usuário após várias jogadas e reloads", async () => {
    // Adiciona uma segunda rodada para testar múltiplas rodadas
    const roomWithTwoRounds = {
      ...baseRoom,
      rodadas: [
        { rodada: 1, codigo: "1234", encerrada: false, inicio: "" },
        { rodada: 2, codigo: "5678", encerrada: false, inicio: "" },
      ],
    };
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockReturnValue({
      room: JSON.parse(JSON.stringify(roomWithTwoRounds)),
      setRoom: () => {},
      loading: false,
      error: null,
      createRoom: async () => null,
      joinRoom: async () => true,
      leaveRoom: async () => true,
      deleteRoom: async () => true,
    });

    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );

    // Joga rodada 1
    const playButton = await screen.findByText(/jogar rodada/i);
    fireEvent.click(playButton);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.change(inputs[1], { target: { value: "2" } });
    fireEvent.change(inputs[2], { target: { value: "3" } });
    fireEvent.change(inputs[3], { target: { value: "4" } });
    fireEvent.click(screen.getByText(/enviar/i));
    await screen.findByText(/você ganhou!/i);
    expect(screen.getByText(/você ganhou!/i)).toBeInTheDocument();

    // Simula reload: re-render
    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );
    // Progresso deve persistir
    expect(
      screen.getByText(/você já ganhou esta rodada hoje/i)
    ).toBeInTheDocument();

    // Joga rodada 2 (erra)
    // Abrir rodada 2
    const playButtons2 = await screen.findAllByText(/jogar rodada/i);
    fireEvent.click(playButtons2[1]);
    const inputs2 = screen.getAllByRole("textbox");
    fireEvent.change(inputs2[0], { target: { value: "0" } });
    fireEvent.change(inputs2[1], { target: { value: "0" } });
    fireEvent.change(inputs2[2], { target: { value: "0" } });
    fireEvent.change(inputs2[3], { target: { value: "0" } });
    fireEvent.click(screen.getByText(/enviar/i));
    await screen.findByText(/você perdeu!/i);
    expect(screen.getByText(/você perdeu!/i)).toBeInTheDocument();

    // Simula novo reload
    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );
    // Progresso da rodada 2 deve persistir
    expect(
      screen.getByText(/você já perdeu esta rodada hoje/i)
    ).toBeInTheDocument();
  });
});
