import { render, screen, fireEvent } from "@testing-library/react";
import { CustomRoomRounds } from "./CustomRoomRounds";
import type { RoomPlayer } from "../../types/customRoom";

describe("CustomRoomRounds", () => {
  const basePlayer: RoomPlayer = {
    id: "user1",
    nome: "Jogador 1",
    terminouRodada: false,
    tentativas: [],
    progresso: [],
  };

  const rodadas = [
    { rodada: 1, modo: "casual", codigo: "1234" },
    { rodada: 2, modo: "desafio", codigo: "5678" },
  ];

  it("exibe mensagem de nenhuma rodada configurada", () => {
    render(
      <CustomRoomRounds
        rodadas={[]}
        player={basePlayer}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/nenhuma rodada configurada/i)).toBeInTheDocument();
  });

  it("exibe rodadas e status de não jogado", () => {
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={basePlayer}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/Rodada 1/)).toBeInTheDocument();
    expect(screen.getByText(/Rodada 2/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/você ainda não jogou esta rodada/i)
    ).toHaveLength(2);
  });

  it("exibe status de vitória e palpites", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 1,
          data: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          tentativas: 2,
          terminou: true,
          win: true,
          palpites: ["1234", "4321"],
        },
      ],
    };
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={player}
        setRodadaAberta={() => {}}
      />
    );
    expect(
      screen.getByText(/você já ganhou esta rodada hoje/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/seus palpites/i)).toBeInTheDocument();
    expect(screen.getByText(/1 2 3 4/)).toBeInTheDocument();
    expect(screen.getByText(/4 3 2 1/)).toBeInTheDocument();
  });

  it("exibe status de derrota", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 2,
          data: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          tentativas: 3,
          terminou: true,
          win: false,
          palpites: ["5678", "8765", "0000"],
        },
      ],
    };
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={player}
        setRodadaAberta={() => {}}
      />
    );
    expect(
      screen.getByText(/você já perdeu esta rodada hoje/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/5 6 7 8/)).toBeInTheDocument();
    expect(screen.getByText(/8 7 6 5/)).toBeInTheDocument();
    expect(screen.getByText(/0 0 0 0/)).toBeInTheDocument();
  });

  it("chama setRodadaAberta ao clicar em Jogar rodada", () => {
    const setRodadaAberta = jest.fn();
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={basePlayer}
        setRodadaAberta={setRodadaAberta}
      />
    );
    const playButtons = screen.getAllByText(/jogar rodada/i);
    fireEvent.click(playButtons[0]);
    expect(setRodadaAberta).toHaveBeenCalledWith(1);
  });

  it("exibe rodada jogada mas não finalizada (em andamento)", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 1,
          data: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          tentativas: 1,
          terminou: false,
          win: false,
          palpites: ["1234"],
        },
      ],
    };
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={player}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/rodada em andamento/i)).toBeInTheDocument();
    expect(screen.getByText(/1 2 3 4/)).toBeInTheDocument();
  });

  it("não mostra progresso de rodada jogada em data diferente do dia atual", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 1,
          data: "20000101",
          tentativas: 2,
          terminou: true,
          win: true,
          palpites: ["9999", "8888"],
        },
      ],
    };
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={player}
        setRodadaAberta={() => {}}
      />
    );
    expect(
      screen.getByText(/você ainda não jogou esta rodada/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/9 9 9 9/)).not.toBeInTheDocument();
  });

  it("lida com rodada com progresso faltando campos opcionais", () => {
    // Simula progresso com palpites undefined
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 2,
          data: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          tentativas: 1,
          terminou: true,
          win: false,
          palpites: undefined,
        },
      ],
    };
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={player}
        setRodadaAberta={() => {}}
      />
    );
    expect(
      screen.getByText(/você já perdeu esta rodada hoje/i)
    ).toBeInTheDocument();
  });

  it("exibe rodada com palpites vazios", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 1,
          data: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          tentativas: 1,
          terminou: true,
          win: true,
          palpites: [],
        },
      ],
    };
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={player}
        setRodadaAberta={() => {}}
      />
    );
    expect(
      screen.getByText(/você já ganhou esta rodada hoje/i)
    ).toBeInTheDocument();
    // Não deve quebrar se palpites for vazio
  });
});
