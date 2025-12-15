// server -> client
export interface RemoteCursorPayload {
  userId: string;
  userName: string;
  color: string;
  cursorPosition: number;
  noteId: string;
}
