beforeAll(() => {
  (import.meta.env as Record<string, string>).VITE_APP_VERSION = "3.0.0";
});
import { screen } from "@testing-library/react";
import { renderWithTheme } from "../test-utils";
import userEvent from "@testing-library/user-event";
import { HelpModal } from "./HelpModal";

describe("HelpModal", () => {
  it("exibe o título e a versão corretamente", () => {
    renderWithTheme(<HelpModal onClose={() => {}} appVersion="3.0.0" />);
    expect(screen.getByText(/Como jogar/i)).toBeInTheDocument();
    expect(screen.getByText(/Versão:/i)).toBeInTheDocument();
    // A versão é dinâmica, mas deve estar presente
    expect(screen.getByText(/3.0.0/)).toBeInTheDocument();
  });

  it("chama onClose ao clicar no overlay", async () => {
    // @ts-expect-error: vi is global in Vitest, but TS pode não reconhecer
    const onClose = typeof vi !== "undefined" ? vi.fn() : jest.fn();
    renderWithTheme(<HelpModal onClose={onClose} />);
    await userEvent.click(screen.getByTestId("modal-overlay"));
    expect(onClose).toHaveBeenCalled();
  });
});
