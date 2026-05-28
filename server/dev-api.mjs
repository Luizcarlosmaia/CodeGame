import http from "node:http";
import { handleApiRequest } from "./apiHandler.mjs";

const PORT = Number(process.env.API_PORT ?? 3001);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

function readBody(req) {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolvePromise(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (!req.url?.startsWith("/api/")) {
    res.writeHead(404, corsHeaders);
    res.end(JSON.stringify({ error: "Rota não encontrada" }));
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const body =
      req.method === "GET" || req.method === "DELETE" ? null : await readBody(req);

    const result = await handleApiRequest({
      method: req.method ?? "GET",
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      body,
    });

    res.writeHead(result.status, corsHeaders);
    res.end(JSON.stringify(result.body));
  } catch (error) {
    console.error(error);
    res.writeHead(500, corsHeaders);
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro interno",
      })
    );
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `[dev-api] Porta ${PORT} já está em uso. Feche o processo anterior ou defina API_PORT no .env.`
    );
    console.error(
      `[dev-api] Windows: Get-NetTCPConnection -LocalPort ${PORT} | Select OwningProcess`
    );
    process.exit(1);
  }

  console.error("[dev-api] Erro ao iniciar servidor:", error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`[dev-api] API local em http://localhost:${PORT}/api`);
});
