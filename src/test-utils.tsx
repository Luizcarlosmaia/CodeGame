import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "./theme";

import type { RenderOptions } from "@testing-library/react";

export function renderWithTheme(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">
) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, options);
}
