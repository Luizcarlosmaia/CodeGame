import { render, screen, fireEvent } from "@testing-library/react";
import CustomRoomRodadaPainel from "./CustomRoomRodadaPainel";

describe("CustomRoomRodadaPainel", () => {
  const baseProps = {
    rodadaInfo: {
      modo: "casual",
      code: ["1", "2", "3", "4"],
      maxTries: 6,
      rodada: { rodada: 1, modo: "casual", codigo: "1234" },
    },
    guesses: [],
    hasWon: false,
    hasFinished: null,
    inputDigits: ["", "", "", ""],
    setInputDigits: jest.fn(),
    setGuesses: jest.fn(),
    handleGuess: jest.fn(),
    setRodadaAberta: jest.fn(),
    setHasFinished: jest.fn(),
  };

  it("renderiza o componente e o Game", () => {
    render(<CustomRoomRodadaPainel {...baseProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("exibe mensagem de vitória", () => {
    render(
      <CustomRoomRodadaPainel
        {...baseProps}
        hasFinished={{ win: true, tries: 3 }}
        setHasFinished={jest.fn()}
      />
    );
    expect(screen.getByText(/você ganhou!/i)).toBeInTheDocument();
  });

  it("exibe mensagem de derrota", () => {
    render(
      <CustomRoomRodadaPainel
        {...baseProps}
        hasFinished={{ win: false, tries: 6 }}
        setHasFinished={jest.fn()}
      />
    );
    expect(screen.getByText(/você perdeu!/i)).toBeInTheDocument();
  });

  it("chama setRodadaAberta ao clicar no botão", () => {
    const setRodadaAberta = jest.fn();
    render(
      <CustomRoomRodadaPainel
        {...baseProps}
        hasFinished={{ win: true, tries: 2 }}
        setRodadaAberta={setRodadaAberta}
        setHasFinished={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(setRodadaAberta).toHaveBeenCalledWith(null);
  });
});
