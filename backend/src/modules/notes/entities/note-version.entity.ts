
export class NoteVersion {
  id: string;
  noteId: string;
  content: any;
  createdAt: Date;

  constructor(partial: Partial<NoteVersion>) {
    Object.assign(this, partial);
  }
}
