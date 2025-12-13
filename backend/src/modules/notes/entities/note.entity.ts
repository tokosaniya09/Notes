
export class Note {
  id: string;
  title: string;
  content: any; // JSON
  isArchived: boolean;
  isDeleted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Note>) {
    Object.assign(this, partial);
  }
}
