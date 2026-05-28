import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomRoomLobby from "./CustomRoomLobby";
import * as useCustomRoomModule from "../../hooks/useCustomRoom";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";
import type { CustomRoom } from "../../types/customRoom";

vi.mock("./CustomRoomChat", () => ({
  default: () => <div data-testid="custom-room-chat" />,
}));

const mockJoinRoom = vi.fn();
const mockLeaveRoom = vi.fn().mockResolvedValue(true);

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

function renderLobby(props = {}) {
  return render(
    <BrowserRouter>
      <CustomRoomLobby
        roomId="sala123"
        userId="user2"
        userName="Participante"
        {...props}
      />
    </BrowserRouter>
  );
}

function confirmAbandon() {
  fireEvent.click(screen.getByText("Abandonar sala"));
  fireEvent.click(screen.getByRole("button", { name: /sim, abandonar/i }));
}

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
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o nome da sala e botões principais", () => {
    renderLobby({ userId: "user2", userName: "Participante" });
    expect(screen.getByText("Sala Teste")).toBeInTheDocument();
    expect(screen.getAllByText("Iniciar Jogo").length).toBeGreaterThan(0);
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
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
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
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });
    renderLobby();
    expect(screen.getByText(/Carregando sala/i)).toBeInTheDocument();
  });

  it("aciona leaveRoom ao confirmar abandono no modal", async () => {
    renderLobby();
    confirmAbandon();
    await waitFor(() => {
      expect(mockLeaveRoom).toHaveBeenCalledWith("sala123", "user2", true);
    });
  });

  it("não mostra alerta de permissão ao abandonar sala", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderLobby({ userId: "user2", userName: "Participante" });
    confirmAbandon();
    await waitFor(() => {
      expect(mockLeaveRoom).toHaveBeenCalledWith("sala123", "user2", true);
    });
    expect(alertSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Você não tem permissão para acessar esta sala")
    );
    alertSpy.mockRestore();
  });

  it("remove usuário da lista de membros para outros usuários", () => {
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
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });

    render(
      <BrowserRouter>
        <CustomRoomLobby roomId="sala123" userId="user1" userName="Dono" />
      </BrowserRouter>
    );

    expect(screen.getAllByText("Dono").length).toBeGreaterThan(0);
    expect(screen.queryByText("Participante")).not.toBeInTheDocument();
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
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });

    renderLobby({ userId: "user2", userName: "Participante" });
    expect(screen.queryByText("Participante")).not.toBeInTheDocument();
  });
});
