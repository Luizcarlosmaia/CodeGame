import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

export interface RoomMessage {
  id?: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export function useRoomChat(roomId: string | undefined) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar mensagens em tempo real
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    const q = query(
      collection(db, "rooms", roomId, "chat"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((doc) => {
            const data = doc.data();
            let createdAt: Date;
            if (data.createdAt instanceof Timestamp) {
              createdAt = data.createdAt.toDate();
            } else if (
              typeof data.createdAt === "string" ||
              typeof data.createdAt === "number"
            ) {
              createdAt = new Date(data.createdAt);
            } else {
              createdAt = new Date(); // fallback para data atual se ausente ou inválido
            }
            return {
              id: doc.id,
              userId: data.userId,
              userName: data.userName,
              text: data.text,
              createdAt,
            } as RoomMessage;
          })
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [roomId]);

  // Enviar mensagem
  const sendMessage = useCallback(
    async (userId: string, userName: string, text: string) => {
      if (!roomId) return;
      setLoading(true);
      try {
        await addDoc(collection(db, "rooms", roomId, "chat"), {
          userId,
          userName,
          text,
          createdAt: Timestamp.now(),
        });
        setLoading(false);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Erro desconhecido ao enviar mensagem.");
        }
        setLoading(false);
      }
    },
    [roomId]
  );

  return { messages, loading, error, sendMessage };
}
