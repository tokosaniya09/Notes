import { Inject, Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './providers/ai-provider.interface';
import { SummarizeDto } from './dto/summarize.dto';
import { RewriteDto } from './dto/rewrite.dto';
import { AskDto } from './dto/ask.dto';
import { Observable } from 'rxjs';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @Inject('AI_PROVIDER') private readonly aiProvider: AIProvider,
  ) {}

  async summarize(dto: SummarizeDto) {
    const prompt = `Please summarize the following content in ${dto.format} format:\n\n${dto.content}`;
    const systemInstruction = 'You are a helpful and concise note-taking assistant.';
    
    return this.aiProvider.generateText(prompt, systemInstruction);
  }

  async rewrite(dto: RewriteDto) {
    const prompt = `Rewrite the following text with this instruction: "${dto.instruction}".\n\nOriginal Text:\n${dto.content}`;
    const systemInstruction = 'You are an expert editor and writing assistant.';
    
    return this.aiProvider.generateText(prompt, systemInstruction);
  }

  /**
   * Ask Q&A (Standard Response)
   */
  async ask(dto: AskDto) {
    const prompt = `Context:\n${dto.context}\n\nQuestion: ${dto.question}`;
    const systemInstruction = dto.tone 
      ? `You are a helpful assistant. Answer in a ${dto.tone} tone.` 
      : 'You are a helpful assistant answering questions based strictly on the provided context.';

    return this.aiProvider.generateText(prompt, systemInstruction);
  }

  /**
   * Ask Q&A (Streaming Response)
   */
  askStream(dto: AskDto): Observable<string> {
    const prompt = `Context:\n${dto.context}\n\nQuestion: ${dto.question}`;
    const systemInstruction = 'You are a helpful assistant. Provide a streaming answer based on the context.';

    return this.aiProvider.generateStream(prompt, systemInstruction);
  }
}