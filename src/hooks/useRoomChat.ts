import { useEffect, useState, useCallback } from "react";
import { roomsApi } from "../api/roomsApi";

export interface RoomMessage {
  id?: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

const POLL_INTERVAL_MS = 2000;

export function useRoomChat(roomId: string | undefined) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    setLoading(true);

    const fetchMessages = async () => {
      try {
        const data = await roomsApi.getChatMessages(roomId);
        if (!cancelled) {
          setMessages(
            data.map((message) => ({
              id: message.id,
              userId: message.userId,
              userName: message.userName,
              text: message.text,
              createdAt: new Date(message.createdAt),
            }))
          );
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao buscar mensagens");
          setLoading(false);
        }
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    async (userId: string, userName: string, text: string) => {
      if (!roomId) return;

      setLoading(true);
      try {
        await roomsApi.sendChatMessage(roomId, { userId, userName, text });
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao enviar mensagem."
        );
        setLoading(false);
      }
    },
    [roomId]
  );

  return { messages, loading, error, sendMessage };
}
