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
const mockDeleteRoom = vi.fn().mockResolvedValue(true);

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

function confirmDelete() {
  fireEvent.click(screen.getByText("Excluir sala"));
  fireEvent.click(screen.getByRole("button", { name: /sim, excluir/i }));
}

describe("CustomRoomLobby", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("customRoomAccessGranted_sala123", "1");
    vi.spyOn(useCustomRoomModule, "useCustomRoom").mockReturnValue({
      room: { ...baseRoom },
      setRoom: vi.fn(),
      loading: false,
      error: null,
      createRoom: vi.fn(),
      joinRoom: mockJoinRoom,
      leaveRoom: mockLeaveRoom,
      deleteRoom: mockDeleteRoom,
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o nome da sala e botões principais", () => {
    renderLobby({ userId: "user2", userName: "Participante" });
    expect(screen.getByText("Sala Teste")).toBeInTheDocument();
    expect(screen.getAllByText("Iniciar Jogo").length).toBeGreaterThan(0);
    expect(screen.getByText("Abandonar sala")).toBeInTheDocument();
    expect(screen.getAllByTestId("custom-room-chat").length).toBeGreaterThan(0);
  });

  it("mostra mensagem de erro se houver erro", async () => {
    vi.spyOn(useCustomRoomModule, "useCustomRoom").mockReturnValue({
      room: { ...baseRoom },
      setRoom: vi.fn(),
      loading: false,
      error: "Erro ao carregar sala",
      createRoom: vi.fn(),
      joinRoom: mockJoinRoom,
      leaveRoom: mockLeaveRoom,
      deleteRoom: mockDeleteRoom,
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });
    renderLobby({ userId: "user2", userName: "Participante" });
    expect(
      await screen.findByText("Erro ao carregar sala")
    ).toBeInTheDocument();
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
      deleteRoom: mockDeleteRoom,
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

  it("anfitrião vê Excluir sala e aciona deleteRoom ao confirmar", async () => {
    renderLobby({ userId: "user1", userName: "Dono" });

    expect(screen.getByText("Excluir sala")).toBeInTheDocument();
    expect(screen.queryByText("Abandonar sala")).not.toBeInTheDocument();

    confirmDelete();

    await waitFor(() => {
      expect(mockDeleteRoom).toHaveBeenCalledWith("sala123");
    });
    expect(mockLeaveRoom).not.toHaveBeenCalled();
  });

  it("participante vê Abandonar sala e não vê Excluir sala", () => {
    renderLobby({ userId: "user2", userName: "Participante" });

    expect(screen.getByText("Abandonar sala")).toBeInTheDocument();
    expect(screen.queryByText("Excluir sala")).not.toBeInTheDocument();
  });

  describe("controles exclusivos do anfitrião", () => {
    const roomWithModes: CustomRoom = {
      ...baseRoom,
      modos: [
        { modo: "casual", rodadas: 1 },
        { modo: "desafio", rodadas: 1 },
      ],
      rodadas: [
        { rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" },
        { rodada: 2, modo: "desafio", codigo: "", encerrada: false, inicio: "" },
      ],
      rankingPeriodo: "semanal",
    };

    const temporaryRoom: CustomRoom = {
      ...roomWithModes,
      type: "temporaria",
      expiraEm: "2099-01-01T00:00:00.000Z",
      partidaNumero: 1,
      rankingPeriodo: undefined,
    };

    function mockRoom(room: CustomRoom) {
      vi.spyOn(useCustomRoomModule, "useCustomRoom").mockReturnValue({
        room,
        setRoom: vi.fn(),
        loading: false,
        error: null,
        createRoom: vi.fn(),
        joinRoom: mockJoinRoom,
        leaveRoom: mockLeaveRoom,
        deleteRoom: mockDeleteRoom,
        transferOwnership: vi.fn(),
        startNewMatch: vi.fn(),
        updateRoomSettings: vi.fn(),
      });
    }

    it("participante não vê painel de configurações editáveis da sala", () => {
      mockRoom(roomWithModes);
      renderLobby({ userId: "user2", userName: "Participante" });

      expect(screen.queryByText("Configurações da sala")).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/^nome da sala$/i)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /salvar nome/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /salvar modos/i })).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/reset do ranking/i)).not.toBeInTheDocument();
    });

    it("anfitrião vê painel de configurações editáveis da sala", () => {
      mockRoom(roomWithModes);
      renderLobby({ userId: "user1", userName: "Dono" });

      expect(screen.getByText("Configurações da sala")).toBeInTheDocument();
      expect(screen.getByLabelText(/^nome da sala$/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /salvar nome/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/reset do ranking/i)).toBeInTheDocument();
    });

    it("participante ainda vê resumo read-only da partida", () => {
      mockRoom(roomWithModes);
      renderLobby({ userId: "user2", userName: "Participante" });

      expect(screen.getByText("Configuração da partida")).toBeInTheDocument();
      expect(screen.getAllByText(/Cores/i).length).toBeGreaterThan(0);
    });

    it("participante não vê ações de transferir ou expulsar", () => {
      mockRoom(roomWithModes);
      renderLobby({ userId: "user2", userName: "Participante" });

      expect(
        screen.queryByRole("button", { name: /tornar anfitrião/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /expulsar/i })).not.toBeInTheDocument();
      expect(
        screen.queryByText(/transferir ou expulsar/i)
      ).not.toBeInTheDocument();
    });

    it("anfitrião vê ações de transferir e expulsar outros jogadores", () => {
      mockRoom(roomWithModes);
      renderLobby({ userId: "user1", userName: "Dono" });

      expect(screen.getByRole("button", { name: /tornar anfitrião/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /expulsar/i })).toBeInTheDocument();
    });

    it("participante não vê Nova partida em sala temporária", () => {
      mockRoom(temporaryRoom);
      renderLobby({ userId: "user2", userName: "Participante" });

      expect(screen.queryByText("Nova partida")).not.toBeInTheDocument();
    });

    it("anfitrião vê Nova partida em sala temporária", () => {
      mockRoom(temporaryRoom);
      renderLobby({ userId: "user1", userName: "Dono" });

      expect(screen.getAllByText("Nova partida").length).toBeGreaterThan(0);
    });

    it("participante não vê badge Você na linha do anfitrião", () => {
      mockRoom(roomWithModes);
      renderLobby({ userId: "user2", userName: "Participante" });

      const hostLine = screen.getByText(/Anfitrião:/i).closest("p");
      expect(hostLine).toBeTruthy();
      expect(hostLine?.textContent).not.toMatch(/Você/);
    });

    it("anfitrião vê badge Você na linha do anfitrião", () => {
      mockRoom(roomWithModes);
      renderLobby({ userId: "user1", userName: "Dono" });

      const hostLine = screen.getByText(/Anfitrião:/i).closest("p");
      expect(hostLine?.textContent).toMatch(/Você/);
    });
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
      deleteRoom: mockDeleteRoom,
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
      deleteRoom: mockDeleteRoom,
      transferOwnership: vi.fn(),
      startNewMatch: vi.fn(),
      updateRoomSettings: vi.fn(),
    });

    renderLobby({ userId: "user2", userName: "Participante" });
    expect(screen.queryByText("Participante")).not.toBeInTheDocument();
  });
});
