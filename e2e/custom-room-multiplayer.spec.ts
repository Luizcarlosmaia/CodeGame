import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const API_BASE = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:3001/api";
const OWNER_ID = "pw-owner";
const GUEST_ID = "pw-guest";

function createRoomPayload(id: string) {
  return {
    id,
    nome: "Sala Playwright",
    type: "permanente",
    ownerId: OWNER_ID,
    admins: [OWNER_ID],
    membros: [
      {
        id: OWNER_ID,
        nome: "Owner PW",
        terminouRodada: false,
        tentativas: [],
        progresso: [],
      },
    ],
    modo: "casual",
    modos: [{ modo: "casual", rodadas: 1 }],
    rodadaAtual: 1,
    rodadas: [{ rodada: 1, modo: "casual", codigo: "", encerrada: false, inicio: "" }],
    ranking: [],
    aberta: true,
    criadaEm: new Date().toISOString(),
    rankingPeriodo: "nunca",
  };
}

async function seedCustomRoomUser(
  page: Page,
  roomId: string,
  userId: string,
  userName: string
) {
  await page.addInitScript(
    ({ roomId, userId, userName }) => {
      localStorage.setItem(`customRoomUserId_${roomId}`, userId);
      localStorage.setItem("customRoomUserName", userName);
      localStorage.setItem(`customRoomAccessGranted_${roomId}`, "1");
    },
    { roomId, userId, userName }
  );
}

async function addGuestMember(request: APIRequestContext, roomId: string) {
  const loaded = await request.get(`${API_BASE}/rooms/${roomId}`);
  expect(loaded.ok()).toBeTruthy();
  const room = await loaded.json();

  const membros = [
    ...room.membros,
    {
      id: GUEST_ID,
      nome: "Guest PW",
      terminouRodada: false,
      tentativas: [],
      progresso: [],
    },
  ];

  const patched = await request.patch(`${API_BASE}/rooms/${roomId}`, {
    data: { membros },
  });
  expect(patched.ok()).toBeTruthy();
}

test.describe("Custom room multiplayer (API + UI)", () => {
  let roomId = "";

  test.beforeAll(async ({ request }) => {
    roomId = `E2E-PW-${Date.now()}`;
    const response = await request.post(`${API_BASE}/rooms`, {
      data: createRoomPayload(roomId),
    });
    expect(response.ok()).toBeTruthy();
    await addGuestMember(request, roomId);
  });

  test.afterAll(async ({ request }) => {
    if (roomId) {
      await request.delete(`${API_BASE}/rooms/${roomId}`);
    }
  });

  test("dois jogadores abrem lobby da mesma sala", async ({ browser }) => {
    const ownerContext = await browser.newContext();
    const guestContext = await browser.newContext();

    const ownerPage = await ownerContext.newPage();
    const guestPage = await guestContext.newPage();

    await seedCustomRoomUser(ownerPage, roomId, OWNER_ID, "Owner PW");
    await seedCustomRoomUser(guestPage, roomId, GUEST_ID, "Guest PW");

    await ownerPage.goto(`/custom/lobby/${roomId}`);
    await guestPage.goto(`/custom/lobby/${roomId}`);

    await expect(ownerPage.getByText("Sala Playwright")).toBeVisible({ timeout: 15_000 });
    await expect(guestPage.getByText("Sala Playwright")).toBeVisible({ timeout: 15_000 });

    await ownerContext.close();
    await guestContext.close();
  });

  test("navega do lobby para tela de jogo após entrada confirmada", async ({ page }) => {
    await seedCustomRoomUser(page, roomId, OWNER_ID, "Owner PW");

    await page.goto(`/custom/lobby/${roomId}`);
    await expect(page.getByText("Sala Playwright")).toBeVisible({ timeout: 15_000 });

    await page.goto(`/custom/game/${roomId}`);
    await expect(page.getByText(/rodada 1/i)).toBeVisible({ timeout: 15_000 });
  });

    await page.addInitScript(
      ({ roomId, userId, userName }) => {
        localStorage.setItem(`customRoomUserId_${roomId}`, userId);
        localStorage.setItem("customRoomUserName", userName);
      },
      { roomId, userId: GUEST_ID, userName: "Guest PW" }
    );

    await page.goto(`/custom/lobby/${roomId}`);
    await expect(page.getByRole("heading", { name: /entrar em uma sala/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("textbox", { name: /código/i })).toHaveValue(roomId);
  });
});
