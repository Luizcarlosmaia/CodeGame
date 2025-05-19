import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Importa o Tailwind CSS

// Registro do service worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
