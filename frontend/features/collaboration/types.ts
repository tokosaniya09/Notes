
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

export interface TextUpdatePayload {
    userId: string;
    content: string;
    timestamp: number;
}

export const COLLAB_EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  CLIENT_CURSOR: 'client_cursor',
  CLIENT_TEXT_UPDATE: 'client_text_update',
  
  // Server -> Client
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  REMOTE_CURSOR: 'remote_cursor',
  REMOTE_TEXT_UPDATE: 'remote_text_update',
  PRESENCE_SYNC: 'presence_sync',
};
