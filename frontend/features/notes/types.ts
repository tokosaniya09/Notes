
export interface Note {
  id: string;
  title: string;
  content: Record<string, any>; // JSON content
  isArchived: boolean;
  isShared: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Extended properties from backend
  permission?: 'OWNER' | 'EDIT' | 'VIEW';
  owner?: {
      firstName: string;
      email: string;
  }
}

export interface Collaborator {
    id: string;
    noteId: string;
    userId: string;
    permission: 'VIEW' | 'EDIT';
    user: {
        id: string;
        email: string;
        firstName: string;
        avatar?: string;
    }
}

export interface CreateNoteDto {
  title?: string;
  content?: Record<string, any>;
}

export interface UpdateNoteDto {
  title?: string;
  content?: Record<string, any>;
  isArchived?: boolean;
  isShared?: boolean;
}

export interface NotesListParams {
  page?: number;
  limit?: number;
  search?: string;
  isArchived?: boolean;
}
