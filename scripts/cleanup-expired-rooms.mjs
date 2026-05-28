/**
 * Remove salas temporárias expiradas da base (cron diário).
 *
 * Uso local:
 *   CRON_SECRET=xxx API_URL=https://seu-site.netlify.app/api node scripts/cleanup-expired-rooms.mjs
 *
 * Em dev (com npm run dev):
 *   node scripts/cleanup-expired-rooms.mjs
 */

const API_URL =
  process.env.API_URL ??
  process.env.VITE_API_URL ??
  "http://localhost:5173/api";
const CRON_SECRET = process.env.CRON_SECRET;

const query = CRON_SECRET
  ? `?secret=${encodeURIComponent(CRON_SECRET)}`
  : "";

const url = `${API_URL.replace(/\/+$/, "")}/rooms/cleanup-expired${query}`;

const response = await fetch(url, { method: "POST" });
const raw = await response.text();

let payload;
try {
  payload = raw ? JSON.parse(raw) : null;
} catch {
  console.error("Resposta inválida:", raw.slice(0, 200));
  process.exit(1);
}

if (!response.ok) {
  console.error("Falha no cleanup:", payload?.error ?? response.statusText);
  process.exit(1);
}

console.log(
  `Cleanup OK — removidas ${payload.deleted} sala(s):`,
  payload.ids?.join(", ") || "(nenhuma)"
);
