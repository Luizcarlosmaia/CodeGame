import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomRoomLobby from "./CustomRoomLobby";
import * as useCustomRoomModule from "../../hooks/useCustomRoom";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock CustomRoomChat to avoid unrelated rendering
vi.mock("./CustomRoomChat", () => ({
  default: () => <div data-testid="custom-room-chat" />,
}));

// Mock hooks
const mockJoinRoom = vi.fn();
const mockLeaveRoom = vi.fn();

import type { CustomRoom } from "../../types/customRoom";
const baseRoom: CustomRoom = {
  id: "sala123",
  nome: "Sala Teste",
  type: "permanente",
  ownerId: "user1",
  admins: [],
  membros: [
    {
      id: "user1",
      nome: "Dono",
      progresso: [],
      terminouRodada: false,
      tentativas: [],
    },
    {
      id: "user2",
      nome: "Participante",
      progresso: [],
      terminouRodada: false,
      tentativas: [],
    },
  ],
  modo: "casual",
  rodadaAtual: 1,
  rodadas: [],
  ranking: [],
  aberta: true,
  criadaEm: "2024-01-01T00:00:00Z",
};

describe("CustomRoomLobby", () => {
  beforeEach(() => {
    vi.spyOn(useCustomRoomModule, "useCustomRoom").mockReturnValue({
      room: { ...baseRoom },
      setRoom: vi.fn(),
      loading: false,
      error: null,
      createRoom: vi.fn(),
      joinRoom: mockJoinRoom,
      leaveRoom: mockLeaveRoom,
      deleteRoom: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderLobby(props = {}) {
    return render(
      <BrowserRouter>
        <CustomRoomLobby
          roomId="sala123"
          userId="user2"
          userName="Participante"
          entryData={null}
          {...props}
        />
      </BrowserRouter>
    );
  }

  it("renderiza o nome da sala e botões principais", () => {
    renderLobby();
    expect(screen.getByText("Sala Teste")).toBeInTheDocument();
    expect(screen.getByText("Jogar rodada")).toBeInTheDocument();
    expect(screen.getByText("Abandonar sala")).toBeInTheDocument();
    expect(screen.getByTestId("custom-room-chat")).toBeInTheDocument();
  });

  it("mostra mensagem de erro se houver erro", () => {
    vi.spyOn(useCustomRoomModule, "useCustomRoom").mockReturnValue({
      room: null,
      setRoom: vi.fn(),
      loading: false,
      error: "Erro ao carregar sala",
      createRoom: vi.fn(),
      joinRoom: mockJoinRoom,
      leaveRoom: mockLeaveRoom,
      deleteRoom: vi.fn(),
    });
    renderLobby();
    expect(screen.getByText("Erro ao carregar sala")).toBeInTheDocument();
  });

  it("mostra mensagem de carregando", () => {
    vi.spyOn(useCustomRoomModule, "useCustomRoom").mockReturnValue({
      room: null,
      setRoom: vi.fn(),
      loading: true,
      error: null,
      createRoom: vi.fn(),
      joinRoom: mockJoinRoom,
      leaveRoom: mockLeaveRoom,
      deleteRoom: vi.fn(),
    });
    renderLobby();
    expect(screen.getByText(/Carregando sala/i)).toBeInTheDocument();
  });

  it("aciona leaveRoom ao abandonar sala", async () => {
    window.confirm = vi.fn(() => true);
    renderLobby();
    fireEvent.click(screen.getByText("Abandonar sala"));
    await waitFor(() => {
      expect(mockLeaveRoom).toHaveBeenCalledWith("sala123", "user2", true);
    });
  });

  it("mostra status de membro sendo adicionado se usuário não está na lista", () => {
    vi.spyOn(useCustomRoomModule, "useCustomRoom").mockReturnValue({
      room: {
        ...baseRoom,
        membros: [
          {
            id: "user1",
            nome: "Dono",
            progresso: [],
            terminouRodada: false,
            tentativas: [],
          },
        ],
      },
      setRoom: vi.fn(),
      loading: false,
      error: null,
      createRoom: vi.fn(),
      joinRoom: mockJoinRoom,
      leaveRoom: mockLeaveRoom,
      deleteRoom: vi.fn(),
    });
    renderLobby();
    expect(
      screen.getByText(/Adicionando você como membro/i)
    ).toBeInTheDocument();
  });
});
