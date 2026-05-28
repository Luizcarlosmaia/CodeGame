import React, { useState } from "react";
import { useRoomChat } from "../../hooks/useRoomChat";
import { Send } from "lucide-react";
import { cn } from "../../lib/cn";

interface CustomRoomChatProps {
  roomId: string;
  userId: string;
  userName: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CustomRoomChat: React.FC<CustomRoomChatProps> = ({
  roomId,
  userId,
  userName,
}) => {
  const { messages, loading, sending, error, sendMessage } = useRoomChat(roomId);
  const [text, setText] = useState("");
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollTo({
      top: messagesEndRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setText("");
    await sendMessage(userId, userName, trimmed);
  };

  const isInitialLoad = loading && messages.length === 0;

  return (
    <div className="custom-lobby-chat">
      <div className="custom-lobby-chat-header">
        <h3 className="text-sm font-bold text-ink">Chat da sala</h3>
      </div>

      <div ref={messagesEndRef} className="custom-lobby-chat-messages">
        {isInitialLoad && (
          <p className="py-3 text-center text-xs text-ink-muted">Carregando...</p>
        )}

        {!isInitialLoad && messages.length === 0 && (
          <p className="py-3 text-center text-xs text-ink-muted">
            Nenhuma mensagem ainda.
          </p>
        )}

        {messages.map((msg, index) => {
          const isMine = msg.userId === userId;
          const isPending = msg.id?.startsWith("temp-");

          return (
            <div
              key={msg.id ?? `${msg.userId}-${index}`}
              className={cn(
                "custom-lobby-chat-line",
                isMine && "custom-lobby-chat-line-mine",
                isPending && "opacity-70"
              )}
            >
              <span className="custom-lobby-chat-author">
                {isMine ? "Você" : msg.userName}
              </span>
              <span className="custom-lobby-chat-time">
                {formatTime(msg.createdAt)}
              </span>
              <span className="custom-lobby-chat-text">{msg.text}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="custom-lobby-chat-form">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Mensagem..."
          disabled={isInitialLoad}
          maxLength={200}
          className="input-field custom-lobby-chat-input"
        />
        <button
          type="submit"
          disabled={isInitialLoad || sending || !text.trim()}
          className="custom-lobby-chat-send"
          aria-label="Enviar mensagem"
        >
          <Send size={16} />
        </button>
      </form>

      {error && (
        <p className="custom-lobby-chat-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomRoomChat;
