import { test, expect, type Page } from "@playwright/test";

type OverflowIssue = {
  selector: string;
  text: string;
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
};

async function collectOverflow(
  page: Page,
  selectors: string[]
): Promise<OverflowIssue[]> {
  return page.evaluate((sels) => {
    const issues: OverflowIssue[] = [];

    for (const selector of sels) {
      document.querySelectorAll(selector).forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (!el.textContent?.trim() && selector.includes("input") === false) {
          return;
        }

        const sw = el.scrollWidth;
        const cw = el.clientWidth;
        const sh = el.scrollHeight;
        const ch = el.clientHeight;

        if (sw > cw + 1 || sh > ch + 1) {
          issues.push({
            selector,
            text: (el.textContent ?? "").trim().slice(0, 32),
            scrollWidth: sw,
            clientWidth: cw,
            scrollHeight: sh,
            clientHeight: ch,
          });
        }
      });
    }

    return issues;
  }, selectors);
}

const GAME_CELL_SELECTORS = [
  ".guess-digit-casual",
  ".game-digit-input-casual",
  ".game-desafio-guess",
  ".game-desafio-badge",
  ".game-codigo-mestre-input",
  ".game-codigo-mestre-feedback-value",
  ".game-codigo-mestre-answer-digit",
];

async function submitDigitGuess(page: Page, digits: string[]) {
  const inputs = page.getByRole("textbox");
  for (let i = 0; i < digits.length; i++) {
    await inputs.nth(i).fill(digits[i]);
  }
  await page.getByRole("button", { name: /enviar palpite/i }).click();
}

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-short", width: 390, height: 667 },
] as const;

for (const viewport of viewports) {
  test.describe(`Layout sem overflow — ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("modo Cores com 6 tentativas preenchidas", async ({ page }) => {
      await page.goto("/cores");
      await expect(page.getByRole("button", { name: /enviar palpite/i })).toBeVisible();

      for (let attempt = 0; attempt < 6; attempt++) {
        await submitDigitGuess(page, ["9", "8", "7", "6"]);
      }

      await expect(page.getByRole("textbox").first()).toBeDisabled({
        timeout: 20_000,
      });

      const issues = await collectOverflow(page, GAME_CELL_SELECTORS);
      expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
    });

    test("modo Contagem com 15 tentativas preenchidas", async ({ page }) => {
      await page.goto("/contagem");
      await expect(page.getByRole("button", { name: /enviar palpite/i })).toBeVisible();

      for (let attempt = 0; attempt < 15; attempt++) {
        await submitDigitGuess(page, ["9", "9", "9", "9"]);
      }

      await expect(page.getByRole("textbox").first()).toBeDisabled({
        timeout: 30_000,
      });

      const issues = await collectOverflow(page, GAME_CELL_SELECTORS);
      expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
    });

    test("modo Código Mestre com 12 tentativas (valores 00-99)", async ({ page }) => {
      await page.goto("/codigo-mestre");
      await expect(page.getByRole("button", { name: /enviar palpite/i })).toBeVisible();

      const guesses = [
        ["99", "88", "77", "66"],
        ["98", "87", "76", "65"],
        ["97", "86", "75", "64"],
        ["96", "85", "74", "63"],
        ["95", "84", "73", "62"],
        ["94", "83", "72", "61"],
        ["93", "82", "71", "60"],
        ["92", "81", "70", "59"],
        ["91", "80", "69", "58"],
        ["90", "79", "68", "57"],
        ["89", "78", "67", "56"],
        ["88", "77", "66", "55"],
      ];

      for (const guess of guesses) {
        await submitDigitGuess(page, guess);
      }

      await expect(page.getByRole("textbox").first()).toBeDisabled({
        timeout: 30_000,
      });

      const issues = await collectOverflow(page, GAME_CELL_SELECTORS);
      expect(issues, JSON.stringify(issues, null, 2)).toEqual([]);
    });
  });
}
