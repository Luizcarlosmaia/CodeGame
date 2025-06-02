import { screen, fireEvent, waitFor, within } from "@testing-library/react";
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
  rodadas: [
    { rodada: 1, codigo: "1234", encerrada: false, inicio: "" },
    { rodada: 2, codigo: "5678", encerrada: false, inicio: "" },
  ],
  ranking: [],
  aberta: true,
  criadaEm: new Date().toISOString(),
};

import type { RoomPlayer } from "../../types/customRoom";
describe("CustomRoomGame - persistência de progresso", () => {
  // Simula persistência do progresso entre reloads
  let progressoPersistente: RoomPlayer["progresso"] = [];
  beforeEach(() => {
    progressoPersistente = [];
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === "customRoomUserId_sala1") return "user1";
      if (key === "customRoomUserName") return "Jogador 1";
      return null;
    });
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockImplementation(() => {
      // Atualiza o progresso do membro com o progresso persistente
      const room = JSON.parse(JSON.stringify(baseRoom));
      room.membros[0].progresso = progressoPersistente;
      return {
        room,
        setRoom: (
          value:
            | CustomRoom
            | null
            | ((prev: CustomRoom | null) => CustomRoom | null)
        ) => {
          let updated: CustomRoom | null;
          if (typeof value === "function") {
            updated = (value as (prev: CustomRoom | null) => CustomRoom | null)(
              room
            );
          } else {
            updated = value;
          }
          if (updated && updated.membros && updated.membros[0]) {
            progressoPersistente = updated.membros[0].progresso;
          }
        },
        loading: false,
        error: null,
        createRoom: async () => null,
        joinRoom: async () => true,
        leaveRoom: async () => true,
        deleteRoom: async () => true,
      };
    });
  });

  it("mantém o progresso do usuário após várias jogadas e reloads", async () => {
    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );

    // Joga rodada 1
    fireEvent.click(screen.getByTestId("play-round-1"));
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.change(inputs[1], { target: { value: "2" } });
    fireEvent.change(inputs[2], { target: { value: "3" } });
    fireEvent.change(inputs[3], { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    await waitFor(() => {
      expect(screen.getByText(/você ganhou!/i)).toBeInTheDocument();
    });

    // Simula reload: re-render
    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );
    // Progresso deve persistir: rodada 1 deve estar concluída
    // Busca o status "Concluído" na rodada 1
    const rodada1 = screen.getByText(/rodada 1/i).closest("li");
    expect(rodada1).not.toBeNull();
    if (rodada1) {
      expect(within(rodada1).getByText(/concluído/i)).toBeInTheDocument();
    }

    // Joga rodada 2 (erra)
    fireEvent.click(screen.getByTestId("play-round-2"));
    const inputs2 = screen.getAllByRole("textbox");
    fireEvent.change(inputs2[0], { target: { value: "0" } });
    fireEvent.change(inputs2[1], { target: { value: "0" } });
    fireEvent.change(inputs2[2], { target: { value: "0" } });
    fireEvent.change(inputs2[3], { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    await waitFor(() => {
      expect(screen.getByText(/você perdeu!/i)).toBeInTheDocument();
    });

    // Simula novo reload
    renderWithTheme(
      <MemoryRouter initialEntries={["/custom/game/sala1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
        </Routes>
      </MemoryRouter>
    );
    // Progresso da rodada 2 deve persistir: rodada 2 deve estar concluída (derrota)
    const rodada2 = screen.getByText(/rodada 2/i).closest("li");
    expect(rodada2).not.toBeNull();
    if (rodada2) {
      expect(within(rodada2).getByText(/concluído/i)).toBeInTheDocument();
    }
  });
});
