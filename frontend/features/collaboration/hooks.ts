
import { useEffect, useCallback, useRef } from 'react';
import { socketService } from './socket';
import { useCollaborationStore } from './store';
import { COLLAB_EVENTS, CursorUpdatePayload, PresenceUser, RemoteCursor, TextUpdatePayload } from './types';
import { useCurrentUser } from '@/features/user/hooks';

// Throttle time for cursor updates (ms)
const CURSOR_THROTTLE = 50;

export function useCollaboration(
  noteId: string, 
  onRemoteTextUpdate?: (content: string) => void
) {
  const store = useCollaborationStore();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        const socket = await socketService.connect();
        
        if (!mounted || !socket) return;

        store.setConnected(true);

        // --- Event Listeners ---

        socket.on(COLLAB_EVENTS.PRESENCE_SYNC, (users: PresenceUser[]) => {
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

        // Handle incoming text from other users
        socket.on(COLLAB_EVENTS.REMOTE_TEXT_UPDATE, (payload: TextUpdatePayload) => {
            // Only update if it comes from someone else (redundancy check)
            if (user && payload.userId !== user.id && onRemoteTextUpdate) {
                onRemoteTextUpdate(payload.content);
            }
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
        socket.off(COLLAB_EVENTS.REMOTE_TEXT_UPDATE);
      }
      store.reset();
    };
  }, [noteId, user, onRemoteTextUpdate]);

  return {
    users: store.users.filter(u => u.userId !== user?.id),
    isConnected: store.isConnected,
  };
}

// Hook to broadcast local changes
export function useRealtimeBroadcaster(noteId: string) {
  const lastCursorEmitted = useRef<number>(0);

  const broadcastCursor = useCallback((position: number) => {
    const now = Date.now();
    if (now - lastCursorEmitted.current > CURSOR_THROTTLE) {
      const socket = socketService.getSocket();
      if (socket?.connected) {
        socket.emit(COLLAB_EVENTS.CLIENT_CURSOR, {
          noteId,
          cursorPosition: position,
        } as CursorUpdatePayload);
        lastCursorEmitted.current = now;
      }
    }
  }, [noteId]);

  const broadcastText = useCallback((content: string) => {
    const socket = socketService.getSocket();
    if (socket?.connected) {
      socket.emit(COLLAB_EVENTS.CLIENT_TEXT_UPDATE, {
        noteId,
        content,
      });
    }
  }, [noteId]);

  return { broadcastCursor, broadcastText };
}
