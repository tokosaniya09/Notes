import { IsNotEmpty, IsString } from 'class-validator';

export class RewriteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  instruction: string; // e.g., "Make it more professional", "Fix grammar"
}