import { renderWithTheme } from "../test-utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { Game } from "./Game";
import { type Stats } from "../utils/stats";
import * as statsUtils from "../utils/stats";
import { vi } from "vitest";

function inputGuess(digits: string[]) {
  const inputs = screen.getAllByRole("textbox");
  digits.forEach((digit, i) => {
    fireEvent.change(inputs[i], { target: { value: digit } });
  });
  fireEvent.click(screen.getByRole("button", { name: /enviar palpite/i }));
}

describe("Game integração - envio incompleto", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("não permite enviar palpite com menos de 4 dígitos", () => {
    const code = ["1", "2", "3", "4"];
    let statsResult: Stats | null = null;
    renderWithTheme(
      <Game
        mode="casual"
        onWin={(s) => {
          statsResult = s;
        }}
        __testCode={code}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.change(inputs[1], { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar palpite/i }));

    expect(screen.queryByText(/parabéns/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/você perdeu/i)).not.toBeInTheDocument();
    inputs.forEach((input) => {
      expect(input).not.toBeDisabled();
    });
    expect(statsResult).toBeNull();
  });
});

describe("Game integração - vitória e derrota", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("soma totalGames corretamente ao jogar em dias diferentes (vitória e derrota)", async () => {
    const code = ["1", "2", "3", "4"];
    let statsResult: Stats | null = null;

    const dia1 = "20240519";
    const dia2 = "20240520";
    const spy = vi.spyOn(statsUtils, "todayKey");
    spy.mockImplementation(() => dia1);

    const { unmount } = renderWithTheme(
      <Game
        mode="casual"
        onWin={(s) => {
          statsResult = s;
        }}
        __testCode={code}
      />
    );
    inputGuess(["1", "2", "3", "4"]);
    await screen.findByText(/parabéns/i);
    await waitFor(() => expect(statsResult).not.toBeNull(), { timeout: 2500 });
    const totalAfterDay1 = statsResult!.totalGames;
    unmount();

    spy.mockImplementation(() => dia2);
    statsResult = null;
    const { unmount: unmount2 } = renderWithTheme(
      <Game
        mode="casual"
        onWin={(s) => {
          statsResult = s;
        }}
        __testCode={code}
      />
    );
    for (let i = 0; i < 6; i++) {
      inputGuess(["9", "9", "9", "9"]);
    }
    await screen.findByText(/você perdeu/i);
    await waitFor(() => expect(statsResult).not.toBeNull(), { timeout: 2500 });
    const totalAfterDay2 = statsResult!.totalGames;
    expect(totalAfterDay2).toBe(totalAfterDay1 + 1);
    unmount2();
    spy.mockRestore();
  });

  it("exibe mensagem de vitória, atualiza stats e bloqueia input após ganhar", async () => {
    const code = ["1", "2", "3", "4"];
    let statsResult: Stats | null = null;
    renderWithTheme(
      <Game
        mode="casual"
        onWin={(s) => {
          statsResult = s;
        }}
        __testCode={code}
      />
    );

    inputGuess(["1", "1", "1", "1"]);
    expect(screen.queryByText(/parabéns/i)).not.toBeInTheDocument();
    inputGuess(["1", "2", "3", "4"]);
    await screen.findByText(/parabéns/i);
    await waitFor(() => expect(statsResult).not.toBeNull(), { timeout: 2500 });
    expect(statsResult!.totalGames).toBeGreaterThan(0);
    expect(statsResult!.totalWins).toBeGreaterThan(0);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("exibe mensagem de derrota, atualiza stats e bloqueia input após perder", async () => {
    const code = ["1", "2", "3", "4"];
    let statsResult: Stats | null = null;
    renderWithTheme(
      <Game
        mode="casual"
        onWin={(s) => {
          statsResult = s;
        }}
        __testCode={code}
      />
    );

    for (let i = 0; i < 6; i++) {
      inputGuess(["9", "9", "9", "9"]);
    }
    await screen.findByText(/você perdeu/i);
    await waitFor(() => expect(statsResult).not.toBeNull(), { timeout: 2500 });
    expect(statsResult!.totalGames).toBeGreaterThan(0);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
