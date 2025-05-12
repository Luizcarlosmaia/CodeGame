// src/App.tsx
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme, darkTheme } from "./theme";
import { Game } from "./components/Game";
import styled from "styled-components";

const ToggleWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const ToggleButton = styled.button`
  background: none;
  border: 2px solid ${({ theme }) => theme.colors.grayText};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  color: ${({ theme }) => theme.colors.grayText};
  cursor: pointer;
`;

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const activeTheme = isDark ? darkTheme : theme;

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyles />
      <ToggleWrapper>
        <ToggleButton onClick={() => setIsDark((d) => !d)}>
          {isDark ? "Light Mode" : "Dark Mode"}
        </ToggleButton>
      </ToggleWrapper>
      <Game />
    </ThemeProvider>
  );
};

export default App;
