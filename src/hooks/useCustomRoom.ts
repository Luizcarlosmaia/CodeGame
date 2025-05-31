import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import type { CustomRoom, RoomPlayer } from "../types/customRoom";

// Hook para manipular sala custom no Firestore
export function useCustomRoom(roomId?: string) {
  const [room, setRoom] = useState<CustomRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar sala em tempo real
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "rooms", roomId),
      (snap) => {
        if (snap.exists()) {
          setRoom(snap.data() as CustomRoom);
        } else {
          setRoom(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [roomId]);

  // Criar sala custom
  const createRoom = useCallback(async (room: CustomRoom) => {
    setLoading(true);
    try {
      const ref = doc(db, "rooms", room.id);
      await setDoc(ref, room);
      setLoading(false);
      return room.id;
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      setLoading(false);
      return null;
    }
  }, []);

  // Entrar na sala (adiciona jogador)
  const joinRoom = useCallback(async (roomId: string, player: RoomPlayer) => {
    setLoading(true);
    try {
      const ref = doc(db, "rooms", roomId);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Sala não encontrada");
      const data = snap.data() as CustomRoom;
      const membros: RoomPlayer[] = data.membros || [];
      const progressoRemovidos: CustomRoom["progressoRemovidos"] =
        data.progressoRemovidos || [];

      // Verifica se já existe membro com o mesmo id
      const existing = membros.find((m) => m.id === player.id);
      if (!existing) {
        // Busca progresso antigo em progressoRemovidos
        const progressoAntigoObj = progressoRemovidos.find(
          (p) => p.id === player.id
        );
        const progressoAntigo = progressoAntigoObj?.progresso;
        membros.push({
          ...player,
          progresso: progressoAntigo ?? [],
        });
        // Remove progressoRemovido desse userId, se existir
        const progressoRemovidosAtualizado = progressoRemovidos.filter(
          (p) => p.id !== player.id
        );
        await updateDoc(ref, {
          membros,
          progressoRemovidos: progressoRemovidosAtualizado,
        });
      }
      setLoading(false);
      return true;
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      setLoading(false);
      return false;
    }
  }, []);

  // Sair da sala (remover membro)
  // Se "abandonar" for true, remove o userId da lista de membros E da lista de "acesso direto" (ex: localStorage)
  const leaveRoom = useCallback(
    async (roomId: string, userId: string, abandonar?: boolean) => {
      setLoading(true);
      try {
        const ref = doc(db, "rooms", roomId);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("Sala não encontrada");
        const data = snap.data() as CustomRoom;
        let membros: RoomPlayer[] = data.membros || [];
        let progressoRemovidos: CustomRoom["progressoRemovidos"] =
          data.progressoRemovidos || [];
        // Busca membro a ser removido
        const membroRemovido = membros.find((m) => m.id === userId);
        // Salva progresso do membro removido, se existir
        if (membroRemovido && membroRemovido.progresso) {
          // Remove qualquer progresso antigo desse userId
          progressoRemovidos = progressoRemovidos.filter(
            (p) => p.id !== userId
          );
          progressoRemovidos.push({
            id: userId,
            progresso: membroRemovido.progresso,
          });
        }
        // Se o usuário é o dono:
        if (data.ownerId === userId) {
          // Permite o dono sair de sala permanente, apenas remove dos membros
          membros = membros.filter((m) => m.id !== userId);
          await updateDoc(ref, { membros, progressoRemovidos });
          setLoading(false);
          return true;
        }
        // Se "abandonar" for true, remove do localStorage o vínculo de acesso direto
        if (abandonar) {
          localStorage.removeItem(`customRoomUserId_${roomId}`);
        }
        // Se não é o dono, apenas remove dos membros
        membros = membros.filter((m) => m.id !== userId);
        await updateDoc(ref, { membros, progressoRemovidos });
        setLoading(false);
        return true;
      } catch (e) {
        if (e instanceof Error) setError(e.message);
        setLoading(false);
        return false;
      }
    },
    []
  );

  // Excluir sala (apenas para o dono)
  const deleteRoom = useCallback(async (roomId: string) => {
    setLoading(true);
    try {
      await (
        await import("firebase/firestore")
      ).deleteDoc(doc(db, "rooms", roomId));
      setLoading(false);
      return true;
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      setLoading(false);
      return false;
    }
  }, []);

  return {
    room,
    setRoom,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
  };
}
