import { useEffect, useState, useCallback, useRef } from "react";
import { roomsApi } from "../api/roomsApi";

export interface RoomMessage {
  id?: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

const POLL_INTERVAL_MS = 3000;

function mapMessages(
  data: Awaited<ReturnType<typeof roomsApi.getChatMessages>>
): RoomMessage[] {
  return data.map((message) => ({
    id: message.id,
    userId: message.userId,
    userName: message.userName,
    text: message.text,
    createdAt: new Date(message.createdAt),
  }));
}

export function useRoomChat(roomId: string | undefined) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomIdRef = useRef(roomId);

  roomIdRef.current = roomId;

  const fetchMessages = useCallback(async (silent = false) => {
    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) return;

    if (!silent) setLoading(true);

    try {
      const data = await roomsApi.getChatMessages(currentRoomId);
      setMessages(mapMessages(data));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao buscar mensagens"
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [roomId, fetchMessages]);

  const sendMessage = useCallback(
    async (userId: string, userName: string, text: string) => {
      const currentRoomId = roomIdRef.current;
      if (!currentRoomId) return;

      const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimisticMessage: RoomMessage = {
        id: optimisticId,
        userId,
        userName,
        text,
        createdAt: new Date(),
      };

      setSending(true);
      setMessages((prev) => [...prev, optimisticMessage]);
      setError(null);

      try {
        await roomsApi.sendChatMessage(currentRoomId, {
          userId,
          userName,
          text,
        });
        const data = await roomsApi.getChatMessages(currentRoomId);
        setMessages(mapMessages(data));
      } catch (err) {
        setMessages((prev) =>
          prev.filter((message) => message.id !== optimisticId)
        );
        setError(
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao enviar mensagem."
        );
      } finally {
        setSending(false);
      }
    },
    []
  );

  return { messages, loading, sending, error, sendMessage };
}
