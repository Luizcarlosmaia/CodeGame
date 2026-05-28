import { getFeedback, getCodigoMestreStatuses, getStatuses } from "./getFeedback";

describe("getFeedback", () => {
  const digitCases = [
    {
      label: "5532 vs 5115",
      code: ["5", "5", "3", "2"],
      guess: ["5", "1", "1", "5"],
      feedback: { correctPlace: 1, correctDigit: 1 },
      statuses: ["correct", "absent", "absent", "present"],
    },
    {
      label: "5552 vs 5515",
      code: ["5", "5", "5", "2"],
      guess: ["5", "5", "1", "5"],
      feedback: { correctPlace: 2, correctDigit: 1 },
      statuses: ["correct", "correct", "absent", "present"],
    },
    {
      label: "1122 vs 1212",
      code: ["1", "1", "2", "2"],
      guess: ["1", "2", "1", "2"],
      feedback: { correctPlace: 2, correctDigit: 2 },
      statuses: ["correct", "present", "present", "correct"],
    },
    {
      label: "0000 vs 0000",
      code: ["0", "0", "0", "0"],
      guess: ["0", "0", "0", "0"],
      feedback: { correctPlace: 4, correctDigit: 0 },
      statuses: ["correct", "correct", "correct", "correct"],
    },
    {
      label: "9876 vs 1234",
      code: ["9", "8", "7", "6"],
      guess: ["1", "2", "3", "4"],
      feedback: { correctPlace: 0, correctDigit: 0 },
      statuses: ["absent", "absent", "absent", "absent"],
    },
  ] as const;

  it.each(digitCases)("$label", ({ code, guess, feedback, statuses }) => {
    expect(getFeedback([...guess], [...code])).toEqual(feedback);
    expect(getStatuses([...guess], [...code])).toEqual(statuses);
  });

  it("não lança com caracteres inválidos", () => {
    expect(() => getFeedback(["a", "b", "c", "d"], ["1", "2", "3", "4"])).not.toThrow();
  });
});

describe("getCodigoMestreStatuses", () => {
  const code = ["10", "50", "0", "99"];

  it("marca acertos, higher e lower", () => {
    expect(getCodigoMestreStatuses(["10", "49", "1", "100"], code)).toEqual([
      "correct",
      "higher",
      "lower",
      "empty",
    ]);
  });

  it("normaliza comparação numérica", () => {
    expect(getCodigoMestreStatuses(["10", "50", "00", "99"], code)).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("retorna empty para campos inválidos", () => {
    expect(getCodigoMestreStatuses(["", "abc", "50", "99"], code)).toEqual([
      "empty",
      "empty",
      "lower",
      "correct",
    ]);
  });
});
