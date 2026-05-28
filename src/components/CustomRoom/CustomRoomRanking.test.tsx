import { render, screen } from "@testing-library/react";
import CustomRoomRanking from "./CustomRoomRanking";
import type { RoomRanking, RoomPlayer } from "../../types/customRoom";

describe("CustomRoomRanking", () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const ranking: RoomRanking[] = [
    { playerId: "1", nome: "Alice", pontos: 10 },
    { playerId: "2", nome: "Bob", pontos: 20 },
  ];
  const membros: RoomPlayer[] = [
    {
      id: "1",
      nome: "Alice",
      terminouRodada: false,
      tentativas: [],
      progresso: [
        {
          rodada: 1,
          data: today,
          tentativas: 2,
          terminou: true,
          win: true,
          palpites: ["1234"],
        },
      ],
    },
    {
      id: "2",
      nome: "Bob",
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    },
  ];

  it("exibe mensagem de ranking vazio", () => {
    render(
      <CustomRoomRanking
        ranking={[]}
        membros={[]}
        userId="1"
        totalRodadas={1}
      />
    );
    expect(screen.getByText(/sem ranking ainda/i)).toBeInTheDocument();
  });

  it("exibe apenas jogadores com partida", () => {
    render(
      <CustomRoomRanking
        ranking={ranking}
        membros={membros}
        userId="1"
        totalRodadas={1}
      />
    );
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.queryByText(/^bob$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/10 pts/i)).toBeInTheDocument();
  });

  it("exibe dias e jogos em salas permanentes", () => {
    render(
      <CustomRoomRanking
        ranking={ranking}
        membros={membros}
        userId="1"
        totalRodadas={1}
        roomType="permanente"
        roomCreatedAt="2024-01-01T00:00:00Z"
      />
    );
    expect(screen.getByText(/1 dia · 1 jogo/i)).toBeInTheDocument();
    expect(screen.getByText(/sala ativa há/i)).toBeInTheDocument();
  });

  it("destaca o usuário logado", () => {
    render(
      <CustomRoomRanking
        ranking={ranking}
        membros={membros}
        userId="1"
        totalRodadas={1}
      />
    );
    const alice = screen.getByText(/alice/i).closest("li");
    expect(alice).toHaveClass("custom-lobby-ranking-row-you");
  });

  it("exibe informações do período de ranking permanente", () => {
    render(
      <CustomRoomRanking
        ranking={[]}
        membros={[]}
        userId="1"
        totalRodadas={3}
        roomType="permanente"
        roomCreatedAt="2024-01-01T00:00:00Z"
        rankingPeriodo="semanal"
        rankingResetEm="2099-01-01T03:00:00.000Z"
      />
    );
    expect(screen.getByText(/ranking semanal/i)).toBeInTheDocument();
    expect(screen.getByText(/segunda-feira/i)).toBeInTheDocument();
  });
});
