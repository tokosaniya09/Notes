import { createWithEqualityFn } from "zustand/traditional";
import { PresenceUser, RemoteCursor } from "./types";

interface CollaborationState {
  selfId?: string;
  isConnected: boolean;
  users: PresenceUser[];
  cursors: Record<string, RemoteCursor>;

  setSelfId: (id: string) => void;
  setConnected: (status: boolean) => void;
  setUsers: (users: PresenceUser[]) => void;
  addUser: (user: PresenceUser) => void;
  removeUser: (userId: string) => void;
  updateCursor: (cursor: RemoteCursor) => void;
  reset: () => void;
}

export const useCollaborationStore = createWithEqualityFn<CollaborationState>(
  (set) => ({
    selfId: undefined,
    isConnected: false,
    users: [],
    cursors: {},

    setSelfId: (id) => set({ selfId: id }),

    setConnected: (isConnected) => set({ isConnected }),

    setUsers: (users) => set({ users }),

    addUser: (user) =>
      set((state) =>
        state.users.some((u) => u.userId === user.userId)
          ? state
          : { users: [...state.users, user] }
      ),

    removeUser: (userId) =>
      set((state) => {
        const cursors = { ...state.cursors };
        delete cursors[userId];
        return {
          users: state.users.filter((u) => u.userId !== userId),
          cursors,
        };
      }),

    updateCursor: (cursor) =>
      set((state) => ({
        cursors: {
          ...state.cursors,
          [cursor.userId]: {
            ...cursor,
            lastUpdated: Date.now(),
          },
        },
      })),

    reset: () =>
      set({
        users: [],
        cursors: {},
        isConnected: false,
        selfId: undefined,
      }),
  }),
  Object.is
);
