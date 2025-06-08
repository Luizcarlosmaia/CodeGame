// src/App.tsx
import React from "react";

import { BrowserRouter } from "react-router-dom";

import { GlobalStyles } from "./styles/GlobalStyles";
import AppContent from "./AppContent";
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";

export const App: React.FC = () => {
  // Força o uso do tema claro, mas sem lógica de alternância
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
