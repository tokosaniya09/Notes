import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AskDto {
  @IsString()
  @IsNotEmpty()
  context: string; // The note content to query against

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsString()
  tone?: string;
}