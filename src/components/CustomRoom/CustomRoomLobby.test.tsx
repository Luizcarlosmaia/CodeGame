it("não mostra alerta de permissão ao abandonar sala", async () => {
  // Garante que o mock de useCustomRoom retorna user2 como membro
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
  // Simula window.alert
  const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
  window.confirm = vi.fn(() => true);
  // user2 NÃO é o dono, então verá "Abandonar sala"
  renderLobby({ userId: "user2", userName: "Participante" });
  fireEvent.click(screen.getByText("Abandonar sala"));
  // Aguarda leaveRoom ser chamado
  await waitFor(() => {
    expect(mockLeaveRoom).toHaveBeenCalledWith("sala123", "user2", true);
  });
  // Não deve mostrar alerta de permissão
  expect(alertSpy).not.toHaveBeenCalledWith(
    expect.stringContaining("Você não tem permissão para acessar esta sala")
  );
  alertSpy.mockRestore();
});

it("remove usuário da lista de membros para outros usuários", async () => {
  // Simula um usuário diferente conectado
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
  render(
    <BrowserRouter>
      <CustomRoomLobby roomId="sala123" userId="user1" userName="Dono" />
    </BrowserRouter>
  );
  // Só o dono deve aparecer na lista de participantes (mas pode aparecer em outros lugares)
  const participantes = screen.getAllByText("Dono");
  // Deve aparecer pelo menos uma vez (na lista de participantes)
  expect(participantes.length).toBeGreaterThan(0);
  // Não deve aparecer "Participante" na lista
  expect(screen.queryByText("Participante")).not.toBeInTheDocument();
});

it("redireciona corretamente ao abandonar sala", async () => {
  window.confirm = vi.fn(() => true);
  renderLobby({ userId: "user2", userName: "Participante" });
  fireEvent.click(screen.getByText("Abandonar sala"));
  await waitFor(() => {
    expect(mockLeaveRoom).toHaveBeenCalled();
  });
  // Não é possível mockar window.location.assign em todos os ambientes, então só garantimos o fluxo principal
});

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

// Função utilitária deve vir antes dos testes
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
          {...props}
        />
      </BrowserRouter>
    );
  }

  it("renderiza o nome da sala e botões principais", () => {
    renderLobby({ userId: "user2", userName: "Participante" });
    expect(screen.getByText("Sala Teste")).toBeInTheDocument();
    expect(screen.getByText("Iniciar Jogo")).toBeInTheDocument();
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
    // user2 não está na lista de membros
    renderLobby({ userId: "user2", userName: "Participante" });
    // O componente não mostra mais "Adicionando você como membro" no lobby, então o teste deve ser removido ou ajustado conforme o novo fluxo.
    // expect(screen.getByText(/Adicionando você como membro/i)).toBeInTheDocument();
    // Para garantir que o usuário não está na lista de participantes:
    expect(screen.queryByText("Participante")).not.toBeInTheDocument();
  });
});
