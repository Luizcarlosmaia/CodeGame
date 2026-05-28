import { test, expect } from "@playwright/test";

test.describe("Fluxo crítico - modo casual", () => {
  test("cores → esgotar tentativas bloqueia input", async ({ page }) => {
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

    await expect(page.getByRole("textbox").first()).toBeDisabled({ timeout: 20_000 });
  });
});
