import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class SummarizeDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  @IsIn(['paragraph', 'bullet-points', 'executive-summary'])
  format?: 'paragraph' | 'bullet-points' | 'executive-summary' = 'paragraph';
}