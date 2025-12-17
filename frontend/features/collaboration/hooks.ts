import { useEffect, useRef, useCallback } from "react";
import { socketService } from "./socket";
import { useCollaborationStore } from "./store";
import {
  COLLAB_EVENTS,
  PresenceUser,
  RemoteCursor,
  TextUpdatePayload,
  CursorUpdatePayload,
} from "./types";
import { useCurrentUser } from "@/features/user/hooks";

const CURSOR_THROTTLE = 50;

export function useCollaboration(
  noteId: string,
  onRemoteTextUpdate?: (content: string) => void
) {
  // We use the store hook to get access to actions and state
  const store = useCollaborationStore();
  const { data: user } = useCurrentUser();

  // Keep latest callback without re-registering listeners
  const onRemoteTextUpdateRef = useRef(onRemoteTextUpdate);
  useEffect(() => {
    onRemoteTextUpdateRef.current = onRemoteTextUpdate;
  }, [onRemoteTextUpdate]);

  // Track join status to prevent duplicate JOIN_ROOM
  const joinedRef = useRef(false);

  // Set selfId once
  useEffect(() => {
    if (user?.id) {
      store.setSelfId(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!noteId || !user?.id) return;

    let active = true;

    const init = async () => {
      const socket = await socketService.connect();
      
      if (!socket || !active) return;

      // ---------- Listeners ----------
      // We access 'store' directly inside the callbacks. 
      // Since Zustand actions are stable, this works fine.
      const handlePresenceSync = (users: PresenceUser[]) => store.setUsers(users);
      const handleUserJoined = (u: PresenceUser) => store.addUser(u);
      const handleUserLeft = ({ userId }: { userId: string }) => store.removeUser(userId);
      const handleRemoteCursor = (c: RemoteCursor) => store.updateCursor(c);
      const handleRemoteText = (payload: TextUpdatePayload) => {
        if (payload.userId !== user.id && onRemoteTextUpdateRef.current) {
          onRemoteTextUpdateRef.current(payload.content);
        }
      };

      // ---------- Connection Logic ----------
      const joinRoom = () => {
        if (joinedRef.current) return;

        joinedRef.current = true;
        socket.emit(COLLAB_EVENTS.JOIN_ROOM, { noteId });
        store.setConnected(true);
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
        joinedRef.current = false; 
        store.setConnected(false);
      };

      // Register Listeners
      socket.on(COLLAB_EVENTS.PRESENCE_SYNC, handlePresenceSync);
      socket.on(COLLAB_EVENTS.USER_JOINED, handleUserJoined);
      socket.on(COLLAB_EVENTS.USER_LEFT, handleUserLeft);
      socket.on(COLLAB_EVENTS.REMOTE_CURSOR, handleRemoteCursor);
      socket.on(COLLAB_EVENTS.REMOTE_TEXT_UPDATE, handleRemoteText);
      
      // Auto-rejoin logic
      socket.on("connect", joinRoom);
      socket.on("disconnect", handleDisconnect);

      if (socket.connected) {
        joinRoom();
      }
    };

    init();

    return () => {
      active = false;
      joinedRef.current = false;

      const socket = socketService.getSocket();
      if (socket) {
        socket.emit(COLLAB_EVENTS.LEAVE_ROOM, { noteId });

        socket.off(COLLAB_EVENTS.PRESENCE_SYNC);
        socket.off(COLLAB_EVENTS.USER_JOINED);
        socket.off(COLLAB_EVENTS.USER_LEFT);
        socket.off(COLLAB_EVENTS.REMOTE_CURSOR);
        socket.off(COLLAB_EVENTS.REMOTE_TEXT_UPDATE);
        socket.off("connect"); 
        socket.off("disconnect");
      }

      store.reset();
    };
    // CRITICAL FIX: Removed 'store' from dependencies to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, user?.id]); 

  return {
    users: store.users.filter((u) => u.userId !== store.selfId),
    isConnected: store.isConnected,
  };
}

// ---------------- Broadcaster (No changes needed here) ----------------

export function useRealtimeBroadcaster(noteId: string) {
  const lastCursor = useRef(0);

  const broadcastCursor = useCallback(
    (position: number) => {
      const now = Date.now();
      if (now - lastCursor.current < CURSOR_THROTTLE) return;

      const socket = socketService.getSocket();
      if (socket?.connected) {
        socket.emit(COLLAB_EVENTS.CLIENT_CURSOR, {
          noteId,
          cursorPosition: position,
        } as CursorUpdatePayload);
        lastCursor.current = now;
      }
    },
    [noteId]
  );

  const broadcastText = useCallback(
    (content: string) => {
      const socket = socketService.getSocket();
      if (socket?.connected) {
        socket.emit(COLLAB_EVENTS.CLIENT_TEXT_UPDATE, {
          noteId,
          content,
        });
      }
    },
    [noteId]
  );

  return { broadcastCursor, broadcastText };
}