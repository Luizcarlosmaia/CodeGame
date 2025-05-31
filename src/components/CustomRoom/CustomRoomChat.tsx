import React, { useState } from "react";
import { useRoomChat } from "../../hooks/useRoomChat";
import {
  ChatContainer,
  ChatTitle,
  MessagesContainer,
  EmptyMessage,
  MessageRow,
  MessageUser,
  MessageText,
  MessageTime,
  ChatForm,
  ChatInput,
  ChatButton,
  ErrorMsg,
} from "./CustomRoomChat.styles";

interface CustomRoomChatProps {
  roomId: string;
  userId: string;
  userName: string;
}

const CustomRoomChat: React.FC<CustomRoomChatProps> = ({
  roomId,
  userId,
  userName,
}) => {
  const { messages, loading, error, sendMessage } = useRoomChat(roomId);
  const [text, setText] = useState("");

  // Ref para o container de mensagens
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      await sendMessage(userId, userName, text.trim());
      setText("");
    }
  };

  return (
    <ChatContainer>
      <ChatTitle>Chat da Sala</ChatTitle>
      <MessagesContainer ref={messagesEndRef}>
        {messages.length === 0 && (
          <EmptyMessage>Nenhuma mensagem ainda.</EmptyMessage>
        )}
        {messages.map((msg) => (
          <MessageRow key={msg.id}>
            <MessageUser>{msg.userName}:</MessageUser>{" "}
            <MessageText>{msg.text}</MessageText>
            <MessageTime>
              {msg.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </MessageTime>
          </MessageRow>
        ))}
      </MessagesContainer>
      <ChatForm onSubmit={handleSend}>
        <ChatInput
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
          maxLength={200}
        />
        <ChatButton type="submit" disabled={loading || !text.trim()}>
          Enviar
        </ChatButton>
      </ChatForm>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </ChatContainer>
  );
};

export default CustomRoomChat;
