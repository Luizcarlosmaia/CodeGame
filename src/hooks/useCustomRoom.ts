import { useEffect, useState, useCallback } from "react";
import { roomsApi } from "../api/roomsApi";
import type { CustomRoom, RoomPlayer } from "../types/customRoom";

const POLL_INTERVAL_MS = 2000;

export function useCustomRoom(roomId?: string) {
  const [room, setRoom] = useState<CustomRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    setLoading(true);

    const fetchRoom = async () => {
      try {
        const data = await roomsApi.getRoom(roomId);
        if (!cancelled) {
          setRoom(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao buscar sala");
          setLoading(false);
        }
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId]);

  const createRoom = useCallback(async (roomData: CustomRoom) => {
    setLoading(true);
    try {
      await roomsApi.createRoom(roomData);
      setLoading(false);
      return roomData.id;
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  const joinRoom = useCallback(async (targetRoomId: string, player: RoomPlayer) => {
    setLoading(true);
    try {
      const data = await roomsApi.getRoom(targetRoomId);
      if (!data) throw new Error("Sala não encontrada");

      const membros: RoomPlayer[] = data.membros || [];
      const progressoRemovidos: CustomRoom["progressoRemovidos"] =
        data.progressoRemovidos || [];

      const existing = membros.find((member) => member.id === player.id);
      if (existing) {
        setLoading(false);
        return "already_joined";
      }

      const progressoAntigoObj = progressoRemovidos.find(
        (entry) => entry.id === player.id
      );
      const progressoAntigo = progressoAntigoObj?.progresso;

      membros.push({
        ...player,
        progresso: progressoAntigo ?? [],
      });

      const progressoRemovidosAtualizado = progressoRemovidos.filter(
        (entry) => entry.id !== player.id
      );

      await roomsApi.patchRoom(targetRoomId, {
        membros,
        progressoRemovidos: progressoRemovidosAtualizado,
      });

      setLoading(false);
      return true;
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setLoading(false);
      return false;
    }
  }, []);

  const leaveRoom = useCallback(
    async (targetRoomId: string, userId: string, abandonar?: boolean) => {
      setLoading(true);
      try {
        const data = await roomsApi.getRoom(targetRoomId);
        if (!data) throw new Error("Sala não encontrada");

        let membros: RoomPlayer[] = data.membros || [];
        let progressoRemovidos: CustomRoom["progressoRemovidos"] =
          data.progressoRemovidos || [];

        const membroRemovido = membros.find((member) => member.id === userId);
        if (!membroRemovido) {
          setLoading(false);
          return "not_found";
        }

        if (membroRemovido.progresso) {
          progressoRemovidos = progressoRemovidos.filter(
            (entry) => entry.id !== userId
          );
          progressoRemovidos.push({
            id: userId,
            progresso: membroRemovido.progresso,
          });
        }

        if (data.ownerId === userId) {
          membros = membros.filter((member) => member.id !== userId);
          await roomsApi.patchRoom(targetRoomId, { membros, progressoRemovidos });
          setLoading(false);
          return true;
        }

        if (abandonar) {
          localStorage.removeItem(`customRoomUserId_${targetRoomId}`);
        }

        membros = membros.filter((member) => member.id !== userId);
        await roomsApi.patchRoom(targetRoomId, { membros, progressoRemovidos });
        setLoading(false);
        return true;
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        setLoading(false);
        return false;
      }
    },
    []
  );

  const deleteRoom = useCallback(async (targetRoomId: string) => {
    setLoading(true);
    try {
      await roomsApi.deleteRoom(targetRoomId);
      setLoading(false);
      return true;
    } catch (err) {
      if (err instanceof Error) setError(err.message);
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
