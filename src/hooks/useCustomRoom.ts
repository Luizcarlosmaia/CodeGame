import { useEffect, useState, useCallback } from "react";
import { roomsApi } from "../api/roomsApi";
import type { CustomRoom, RoomPlayer } from "../types/customRoom";
import type { RoomSettingsPayload } from "../utils/customRoomSettings";
import { isRoomPlayable } from "../utils/customRoomLifecycle";
import { clearRoomAccessGranted } from "../utils/customRoomAccess";

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
      throw err;
    }
  }, []);

  const joinRoom = useCallback(async (targetRoomId: string, player: RoomPlayer) => {
    setLoading(true);
    try {
      const data = await roomsApi.getRoom(targetRoomId);
      if (!data) throw new Error("Sala não encontrada");
      if (!isRoomPlayable(data)) {
        throw new Error("Esta sala expirou ou está fechada.");
      }

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
          setError(
            "Transfira a anfitrião para outro jogador ou exclua a sala antes de sair."
          );
          setLoading(false);
          return false;
        }

        if (abandonar) {
          localStorage.removeItem(`customRoomUserId_${targetRoomId}`);
          clearRoomAccessGranted(targetRoomId);
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
      localStorage.removeItem(`customRoomUserId_${targetRoomId}`);
      clearRoomAccessGranted(targetRoomId);
      setLoading(false);
      return true;
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setLoading(false);
      return false;
    }
  }, []);

  const transferOwnership = useCallback(
    async (targetRoomId: string, currentOwnerId: string, newOwnerId: string) => {
      if (currentOwnerId === newOwnerId) return false;

      setLoading(true);
      try {
        const data = await roomsApi.getRoom(targetRoomId);
        if (!data) throw new Error("Sala não encontrada");
        if (data.ownerId !== currentOwnerId) {
          throw new Error("Somente o anfitrião pode transferir a sala.");
        }

        const membros: RoomPlayer[] = data.membros || [];
        if (!membros.some((member) => member.id === newOwnerId)) {
          throw new Error("Jogador não encontrado na sala.");
        }

        const admins = Array.from(
          new Set([
            newOwnerId,
            ...(Array.isArray(data.admins) ? data.admins : []),
          ])
        ).filter((adminId) => membros.some((member) => member.id === adminId));

        await roomsApi.patchRoom(targetRoomId, {
          ownerId: newOwnerId,
          admins,
        });

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

  const startNewMatch = useCallback(
    async (targetRoomId: string, ownerId: string) => {
      setLoading(true);
      try {
        const result = await roomsApi.startNewMatch(targetRoomId, ownerId);
        setRoom(result.room);
        setError(null);
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

  const updateRoomSettings = useCallback(
    async (targetRoomId: string, payload: RoomSettingsPayload) => {
      setLoading(true);
      try {
        const result = await roomsApi.updateRoomSettings(targetRoomId, payload);
        setRoom(result.room);
        setError(null);
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

  return {
    room,
    setRoom,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    transferOwnership,
    startNewMatch,
    updateRoomSettings,
  };
}
