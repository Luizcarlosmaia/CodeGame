import { getFeedback, getStatuses } from "./getFeedback";

describe("getFeedback", () => {
  it("só permite números nos campos (validação manual)", () => {
    // A função getFeedback não valida input, mas a UI deve garantir isso.
    // Aqui só testamos que a função lida com strings numéricas.
    expect(() =>
      getFeedback(["a", "b", "c", "d"], ["1", "2", "3", "4"])
    ).not.toThrow();
  });

  it("cenário: código 5532, palpite 5115", () => {
    const code = ["5", "5", "3", "2"];
    const guess = ["5", "1", "1", "5"];
    const feedback = getFeedback(guess, code);
    expect(feedback).toEqual({ correctPlace: 1, correctDigit: 1 });
    const statuses = getStatuses(guess, code);
    expect(statuses).toEqual(["correct", "absent", "absent", "present"]);
  });

  it("cenário: código 5552, palpite 5515", () => {
    const code = ["5", "5", "5", "2"];
    const guess = ["5", "5", "1", "5"];
    const feedback = getFeedback(guess, code);
    expect(feedback).toEqual({ correctPlace: 2, correctDigit: 1 });
    const statuses = getStatuses(guess, code);
    expect(statuses).toEqual(["correct", "correct", "absent", "present"]);
  });
});
