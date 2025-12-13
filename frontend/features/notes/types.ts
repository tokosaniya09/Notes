
export interface Note {
  id: string;
  title: string;
  content: Record<string, any>; // JSON content
  isArchived: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title?: string;
  content?: Record<string, any>;
}

export interface UpdateNoteDto {
  title?: string;
  content?: Record<string, any>;
  isArchived?: boolean;
}

export interface NotesListParams {
  page?: number;
  limit?: number;
  search?: string;
  isArchived?: boolean;
}
