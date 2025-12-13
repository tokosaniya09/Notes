
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinNoteDto {
  @IsString()
  @IsNotEmpty()
  noteId: string;
}
