import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomRoomChat from "./CustomRoomChat";
import * as useRoomChatModule from "../../hooks/useRoomChat";
import { vi } from "vitest";

const mockSendMessage = vi.fn();

const baseMessages = [
  {
    id: "1",
    userId: "user1",
    userName: "Alice",
    text: "Olá!",
    createdAt: new Date("2023-01-01T10:00:00"),
  },
  {
    id: "2",
    userId: "user2",
    userName: "Bob",
    text: "Oi Alice!",
    createdAt: new Date("2023-01-01T10:01:00"),
  },
];

describe("CustomRoomChat", () => {
  beforeEach(() => {
    vi.spyOn(useRoomChatModule, "useRoomChat").mockReturnValue({
      messages: baseMessages,
      loading: false,
      error: null,
      sendMessage: mockSendMessage,
    });
    mockSendMessage.mockClear();
  });

  it("renders chat title and messages", () => {
    render(<CustomRoomChat roomId="room1" userId="user2" userName="Bob" />);
    expect(screen.getByText("Chat da Sala")).toBeInTheDocument();
    expect(screen.getByText("Alice:")).toBeInTheDocument();
    expect(screen.getByText("Olá!")).toBeInTheDocument();
    expect(screen.getByText("Bob:")).toBeInTheDocument();
    expect(screen.getByText("Oi Alice!")).toBeInTheDocument();
  });

  it("shows empty message when no messages", () => {
    vi.spyOn(useRoomChatModule, "useRoomChat").mockReturnValue({
      messages: [],
      loading: false,
      error: null,
      sendMessage: mockSendMessage,
    });
    render(<CustomRoomChat roomId="room1" userId="user2" userName="Bob" />);
    expect(screen.getByText(/nenhuma mensagem/i)).toBeInTheDocument();
  });

  it("disables input and button when loading", () => {
    vi.spyOn(useRoomChatModule, "useRoomChat").mockReturnValue({
      messages: baseMessages,
      loading: true,
      error: null,
      sendMessage: mockSendMessage,
    });
    render(<CustomRoomChat roomId="room1" userId="user2" userName="Bob" />);
    expect(screen.getByPlaceholderText(/digite sua mensagem/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeDisabled();
  });

  it("calls sendMessage and clears input on submit", async () => {
    render(<CustomRoomChat roomId="room1" userId="user2" userName="Bob" />);
    const input = screen.getByPlaceholderText(/digite sua mensagem/i);
    fireEvent.change(input, { target: { value: "Nova mensagem" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        "user2",
        "Bob",
        "Nova mensagem"
      );
    });
    expect(input).toHaveValue("");
  });

  it("shows error message if error exists", () => {
    vi.spyOn(useRoomChatModule, "useRoomChat").mockReturnValue({
      messages: baseMessages,
      loading: false,
      error: "Erro de chat",
      sendMessage: mockSendMessage,
    });
    render(<CustomRoomChat roomId="room1" userId="user2" userName="Bob" />);
    expect(screen.getByText(/erro de chat/i)).toBeInTheDocument();
  });
});
