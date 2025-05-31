// Backend básico para salas customizadas (Node.js + Express)
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// Mock em memória
const rooms = {};

// Criar sala
app.post("/rooms", (req, res) => {
  // ...criação de sala custom
  res.json({ ok: true, id: "sala-mock" });
});

// Buscar sala
app.get("/rooms/:id", (req, res) => {
  // ...buscar sala
  res.json(rooms[req.params.id] || null);
});

// Entrar na sala
app.post("/rooms/:id/join", (req, res) => {
  // ...entrar na sala
  res.json({ ok: true });
});

// Iniciar partida
app.post("/rooms/:id/start", (req, res) => {
  // ...iniciar partida
  res.json({ ok: true });
});

// Avançar rodada
app.post("/rooms/:id/next-round", (req, res) => {
  // ...próxima rodada
  res.json({ ok: true });
});

// Enviar mensagem no chat
app.post("/rooms/:id/message", (req, res) => {
  // ...enviar mensagem
  res.json({ ok: true });
});

// Finalizar partida
app.post("/rooms/:id/finish", (req, res) => {
  // ...finalizar partida
  res.json({ ok: true });
});

// Ranking final
app.get("/rooms/:id/ranking", (req, res) => {
  // ...ranking
  res.json([]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log("CustomRoom backend rodando na porta", PORT)
);
