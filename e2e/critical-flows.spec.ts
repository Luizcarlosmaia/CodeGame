import { test, expect } from "@playwright/test";
import { expectDailyGameLost } from "./helpers";

test.describe("Fluxo crítico - modo casual", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("cores → esgotar tentativas encerra partida", async ({ page }) => {
    await page.goto("/cores");
    await expect(page.getByRole("button", { name: /enviar palpite/i })).toBeVisible();

    for (let attempt = 0; attempt < 6; attempt++) {
      const inputs = page.getByRole("textbox");
      await inputs.nth(0).fill("9");
      await inputs.nth(1).fill("9");
      await inputs.nth(2).fill("9");
      await inputs.nth(3).fill("9");
      await page.getByRole("button", { name: /enviar palpite/i }).click();
    }

    await expectDailyGameLost(page);
  });
});
