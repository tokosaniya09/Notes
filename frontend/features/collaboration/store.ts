
import { create } from 'zustand';
import { PresenceUser, RemoteCursor } from './types';

interface CollaborationState {
  isConnected: boolean;
  users: PresenceUser[];
  cursors: Record<string, RemoteCursor>;
  
  setConnected: (status: boolean) => void;
  setUsers: (users: PresenceUser[]) => void;
  addUser: (user: PresenceUser) => void;
  removeUser: (userId: string) => void;
  updateCursor: (cursor: RemoteCursor) => void;
  reset: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  isConnected: false,
  users: [],
  cursors: {},

  setConnected: (isConnected) => set({ isConnected }),
  
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => {
    // Prevent duplicates
    if (state.users.some(u => u.userId === user.userId)) return state;
    return { users: [...state.users, user] };
  }),
  
  removeUser: (userId) => set((state) => {
    const newCursors = { ...state.cursors };
    delete newCursors[userId];
    return {
      users: state.users.filter(u => u.userId !== userId),
      cursors: newCursors,
    };
  }),
  
  updateCursor: (cursor) => set((state) => ({
    cursors: {
      ...state.cursors,
      [cursor.userId]: { ...cursor, lastUpdated: Date.now() },
    },
  })),

  reset: () => set({ users: [], cursors: {}, isConnected: false }),
}));
