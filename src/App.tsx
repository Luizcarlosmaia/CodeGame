// src/App.tsx
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter } from "react-router-dom";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme, darkTheme } from "./theme";
import AppContent from "./AppContent";

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);

  return (
    <ThemeProvider theme={isDark ? darkTheme : theme}>
      <GlobalStyles />
      <BrowserRouter>
        <AppContent isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
