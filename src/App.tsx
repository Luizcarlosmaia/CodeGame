// App.tsx
import React, { useState } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme, darkTheme } from "./theme";
import { Game } from "./components/Game";
import {
  Header,
  ModeMenu,
  ThemeToggleWrapper,
  ModeToggleButton,
} from "./styles/AppStyles";

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [mode, setMode] = useState<"easy" | "hard">("easy");
  const activeTheme = isDark ? darkTheme : theme;

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyles />
      <Header>
        <ModeMenu>
          <ModeToggleButton
            active={mode === "easy"}
            onClick={() => setMode("easy")}
          >
            Izy
          </ModeToggleButton>
          <ModeToggleButton
            active={mode === "hard"}
            onClick={() => setMode("hard")}
          >
            Nerd
          </ModeToggleButton>
        </ModeMenu>

        <ThemeToggleWrapper>
          <ModeToggleButton active={false} onClick={() => setIsDark((d) => !d)}>
            {isDark ? "Light Mode" : "Dark Mode"}
          </ModeToggleButton>
        </ThemeToggleWrapper>
      </Header>

      {/* PASSA O mode PARA O GAME */}
      <Game mode={mode} />
    </ThemeProvider>
  );
};

export default App;
