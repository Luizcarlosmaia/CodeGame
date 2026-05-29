import { expect, type APIRequestContext, type Page } from "@playwright/test";

const API_BASE = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:3001/api";

export async function registerE2EUser(request: APIRequestContext) {
  const email = `pw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
  const response = await request.post(`${API_BASE}/auth/register`, {
    data: {
      email,
      password: "testpassword123",
      displayName: "Playwright E2E",
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return {
    token: body.token as string,
    userId: body.user.id as string,
    headers: { authorization: `Bearer ${body.token}` },
  };
}

/** Após esgotar tentativas, a UI remove os inputs (não apenas desabilita). */
export async function expectDailyGameLost(page: Page) {
  await expect(page.getByText(/não foi dessa vez/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /enviar palpite/i })).toHaveCount(0);
}
