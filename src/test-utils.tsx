import React from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";

export function renderWithTheme(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">
) {
  return render(ui, options);
}
