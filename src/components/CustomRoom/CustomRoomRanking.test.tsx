import { render, screen } from "@testing-library/react";
import CustomRoomRanking from "./CustomRoomRanking";
import type { RoomRanking, RoomPlayer } from "../../types/customRoom";

describe("CustomRoomRanking", () => {
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
          data: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
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
    render(<CustomRoomRanking ranking={[]} membros={[]} userId="1" />);
    expect(screen.getByText(/sem ranking ainda/i)).toBeInTheDocument();
  });

  it("exibe todos os jogadores do ranking", () => {
    render(
      <CustomRoomRanking ranking={ranking} membros={membros} userId="1" />
    );
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByText(/10 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/20 pts/i)).toBeInTheDocument();
  });

  it("destaca o usuário logado", () => {
    render(
      <CustomRoomRanking ranking={ranking} membros={membros} userId="1" />
    );
    const alice = screen.getByText(/alice/i).closest("li");
    expect(alice).toHaveStyle("color: #388e3c");
    expect(alice).toHaveStyle("background: #eafbe7");
  });

  it("exibe (já jogou hoje) se aplicável", () => {
    render(
      <CustomRoomRanking ranking={ranking} membros={membros} userId="1" />
    );
    expect(screen.getByText(/já jogou hoje/i)).toBeInTheDocument();
  });
});
