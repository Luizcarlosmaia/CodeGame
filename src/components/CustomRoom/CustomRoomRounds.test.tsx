import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { CustomRoomRounds } from "./CustomRoomRounds";
import type { RoomPlayer } from "../../types/customRoom";
import { todayKey } from "../../utils/stats";

describe("CustomRoomRounds", () => {
  const today = todayKey();
  const permanentRoom = { type: "permanente" as const, partidaNumero: undefined };
  const temporaryRoom = { type: "temporaria" as const, partidaNumero: 2 };

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
        room={permanentRoom}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/nenhuma rodada configurada/i)).toBeInTheDocument();
  });

  it("exibe rodadas não iniciadas com botão de jogar", () => {
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={basePlayer}
        room={permanentRoom}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/Rodada 1/)).toBeInTheDocument();
    expect(screen.getByText(/Rodada 2/)).toBeInTheDocument();
    expect(screen.getAllByText(/não iniciada/i)).toHaveLength(2);
    expect(screen.getAllByText(/jogar rodada/i)).toHaveLength(2);
  });

  it("exibe vitória, pontos e tentativas coloridas no card", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 1,
          data: today,
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
        room={permanentRoom}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/acertou em 2 tentativas/i)).toBeInTheDocument();
    expect(screen.getByText(/\+5 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/1 2 3 4/)).toBeInTheDocument();
    expect(screen.getByText(/4 3 2 1/)).toBeInTheDocument();
    expect(screen.queryByText(/ver resultado/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("play-round-1")).not.toBeInTheDocument();
  });

  it("exibe derrota com última tentativa destacada", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 2,
          data: today,
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
        room={permanentRoom}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/esgotou em 3 tentativas/i)).toBeInTheDocument();
    expect(screen.getByText(/0 0 0 0/)).toHaveClass("custom-game-guess-chip-loss");
  });

  it("chama setRodadaAberta ao clicar em Jogar rodada", () => {
    const setRodadaAberta = vi.fn();
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={basePlayer}
        room={permanentRoom}
        setRodadaAberta={setRodadaAberta}
      />
    );
    fireEvent.click(screen.getAllByText(/jogar rodada/i)[0]);
    expect(setRodadaAberta).toHaveBeenCalledWith(1);
  });

  it("exibe rodada em andamento com botão continuar", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 1,
          data: today,
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
        room={permanentRoom}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/em andamento/i)).toBeInTheDocument();
    expect(screen.getByText(/continuar rodada/i)).toBeInTheDocument();
    expect(screen.getByText(/1 2 3 4/)).toBeInTheDocument();
  });

  it("não mostra progresso de outro dia", () => {
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
        room={permanentRoom}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getAllByText(/não iniciada/i)).toHaveLength(2);
    expect(screen.queryByText(/9 9 9 9/)).not.toBeInTheDocument();
  });

  it("mostra progresso legado em sala temporária", () => {
    const player: RoomPlayer = {
      ...basePlayer,
      progresso: [
        {
          rodada: 1,
          data: "20260527",
          tentativas: 3,
          terminou: false,
          win: false,
          palpites: ["0000", "1459", "9745"],
        },
      ],
    };
    render(
      <CustomRoomRounds
        rodadas={rodadas}
        player={player}
        room={temporaryRoom}
        setRodadaAberta={() => {}}
      />
    );
    expect(screen.getByText(/em andamento/i)).toBeInTheDocument();
    expect(screen.getByText(/continuar rodada/i)).toBeInTheDocument();
  });
});
