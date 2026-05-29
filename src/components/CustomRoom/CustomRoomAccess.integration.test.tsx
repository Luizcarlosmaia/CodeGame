import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomRoomGame from "./CustomRoomGame";
import CustomRoomLobby from "./CustomRoomLobby";
import CustomRoomFlow from "./CustomRoomFlow";
import CustomRoomJoinPage from "../../pages/CustomRoomJoinPage";
import * as useCustomRoomHook from "../../hooks/useCustomRoom";
import { createUseCustomRoomMock } from "../../test/mockUseCustomRoom";
import type { CustomRoom } from "../../types/customRoom";
import * as customRoomResume from "../../utils/customRoomResume";

vi.mock("../../utils/customRoomStorage", () => ({
  fetchMyCustomRooms: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: unknown }) => children,
}));

vi.mock("../../api/roomsApi", () => ({
  roomsApi: {
    getRoom: vi.fn(),
    patchRoom: vi.fn(),
    roomExists: vi.fn(),
    validateResume: vi.fn(),
  },
}));

const baseRoom: CustomRoom = {
  id: "SECURE1",
  nome: "Sala Segura",
  type: "permanente",
  ownerId: "user1",
  admins: ["user1"],
  membros: [
    {
      id: "user1",
      nome: "Anfitrião",
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    },
  ],
  modo: "casual",
  rodadaAtual: 1,
  rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
  ranking: [],
  aberta: true,
  criadaEm: new Date().toISOString(),
};

function mockStorage(userId: string, withAccess: boolean) {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
    if (key === "customRoomUserId_SECURE1") return userId;
    if (key === "customRoomUserName") return "Anfitrião";
    if (withAccess && key === "customRoomAccessGranted_SECURE1") return "1";
    return null;
  });
}

describe("CustomRoom — segurança de acesso por código", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(useCustomRoomHook, "useCustomRoom").mockReturnValue(
      createUseCustomRoomMock(baseRoom)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redireciona link direto do lobby para tela de entrar com código", async () => {
    mockStorage("user1", false);

    render(
      <MemoryRouter initialEntries={["/custom/lobby/SECURE1"]}>
        <Routes>
          <Route
            path="/custom/lobby/:roomId"
            element={
              <CustomRoomLobby
                roomId="SECURE1"
                userId="user1"
                userName="Anfitrião"
              />
            }
          />
          <Route path="/custom/entrar" element={<CustomRoomJoinPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /entrar em uma sala/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("textbox", { name: /código/i })).toHaveValue("SECURE1");
  });

  it("aba sem identidade (ex.: anônima) não fica em Verificando acesso", async () => {
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={["/custom/lobby/SECURE1"]}>
        <Routes>
          <Route path="/custom/lobby/:roomId" element={<CustomRoomFlow />} />
          <Route path="/custom/entrar" element={<CustomRoomJoinPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /entrar em uma sala/i })).toBeInTheDocument();
    });
    expect(screen.queryByText(/verificando acesso/i)).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /código/i })).toHaveValue("SECURE1");
  });

  it("redireciona link direto do jogo para tela de entrar", async () => {
    mockStorage("user1", false);

    render(
      <MemoryRouter initialEntries={["/custom/game/SECURE1"]}>
        <Routes>
          <Route path="/custom/game/:roomId" element={<CustomRoomGame />} />
          <Route path="/custom/entrar" element={<CustomRoomJoinPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /entrar em uma sala/i })).toBeInTheDocument();
    });
  });

  it("permite lobby após retomada gravar acesso local (sem tela de código)", async () => {
    customRoomResume.persistGuestMemberIdentity("SECURE1", "user1", "Anfitrião");

    render(
      <MemoryRouter initialEntries={["/custom/lobby/SECURE1"]}>
        <Routes>
          <Route path="/custom/lobby/:roomId" element={<CustomRoomFlow />} />
          <Route path="/custom/entrar" element={<CustomRoomJoinPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sala Segura")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /entrar em uma sala/i })).not.toBeInTheDocument();
  });

  it("permite lobby quando entrada foi confirmada", async () => {
    mockStorage("user1", true);

    render(
      <MemoryRouter initialEntries={["/custom/lobby/SECURE1"]}>
        <Routes>
          <Route
            path="/custom/lobby/:roomId"
            element={
              <CustomRoomLobby
                roomId="SECURE1"
                userId="user1"
                userName="Anfitrião"
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Sala Segura")).toBeInTheDocument();
  });
});
