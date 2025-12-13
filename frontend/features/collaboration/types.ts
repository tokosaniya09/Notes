
export interface PresenceUser {
  userId: string;
  userName: string;
  color: string;
  connectedAt: string;
  avatar?: string;
}

export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  cursorPosition: number; // Index in text
  lastUpdated: number;
}

export interface CursorUpdatePayload {
  noteId: string;
  cursorPosition: number;
  userName?: string;
  color?: string;
}

export const COLLAB_EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  CLIENT_CURSOR: 'client_cursor',
  
  // Server -> Client
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  REMOTE_CURSOR: 'remote_cursor',
  PRESENCE_SYNC: 'presence_sync',
};
