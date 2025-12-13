
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CursorUpdateDto {
  @IsString()
  @IsNotEmpty()
  noteId: string;

  @IsNumber()
  cursorPosition: number; // Text index

  @IsString()
  @IsOptional()
  selectionEnd?: number; // For text selection ranges

  @IsString()
  userName: string;
  
  @IsString()
  color: string;
}
