
import { useEffect, useCallback, useRef } from 'react';
import { socketService } from './socket';
import { useCollaborationStore } from './store';
import { COLLAB_EVENTS, CursorUpdatePayload, PresenceUser, RemoteCursor } from './types';
import { useCurrentUser } from '@/features/user/hooks';

// Throttle time for cursor updates (ms)
const CURSOR_THROTTLE = 100;

export function useCollaboration(noteId: string) {
  const store = useCollaborationStore();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        const socket = await socketService.connect();
        
        if (!mounted) return;

        store.setConnected(true);

        // Event Listeners
        socket.on(COLLAB_EVENTS.PRESENCE_SYNC, (users: PresenceUser[]) => {
          // Filter out self from list if needed, but showing self in list is okay too.
          // Usually we want to filter self from "remote" lists but keep in "all users".
          // For now, we store all.
          store.setUsers(users);
        });

        socket.on(COLLAB_EVENTS.USER_JOINED, (newUser: PresenceUser) => {
            store.addUser(newUser);
        });

        socket.on(COLLAB_EVENTS.USER_LEFT, ({ userId }: { userId: string }) => {
            store.removeUser(userId);
        });

        socket.on(COLLAB_EVENTS.REMOTE_CURSOR, (cursor: RemoteCursor) => {
            store.updateCursor(cursor);
        });

        // Join Room
        socket.emit(COLLAB_EVENTS.JOIN_ROOM, { noteId });

      } catch (e) {
        console.error("Failed to initialize collaboration:", e);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit(COLLAB_EVENTS.LEAVE_ROOM, { noteId });
        socket.off(COLLAB_EVENTS.PRESENCE_SYNC);
        socket.off(COLLAB_EVENTS.USER_JOINED);
        socket.off(COLLAB_EVENTS.USER_LEFT);
        socket.off(COLLAB_EVENTS.REMOTE_CURSOR);
        // We do not disconnect the socket entirely, just leave room, 
        // to keep connection alive for navigation between notes.
      }
      store.reset();
    };
  }, [noteId]);

  return {
    users: store.users.filter(u => u.userId !== user?.id), // Exclude self from visual lists
    isConnected: store.isConnected,
  };
}

export function useCursorBroadcaster(noteId: string) {
  const lastEmitted = useRef<number>(0);

  const broadcastCursor = useCallback((position: number) => {
    const now = Date.now();
    if (now - lastEmitted.current > CURSOR_THROTTLE) {
      const socket = socketService.getSocket();
      if (socket?.connected) {
        socket.emit(COLLAB_EVENTS.CLIENT_CURSOR, {
          noteId,
          cursorPosition: position,
        } as CursorUpdatePayload);
        lastEmitted.current = now;
      }
    }
  }, [noteId]);

  return broadcastCursor;
}
