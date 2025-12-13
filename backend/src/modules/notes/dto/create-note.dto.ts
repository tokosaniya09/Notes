
import { IsOptional, IsString, IsObject, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;
}
