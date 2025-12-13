import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Observable, Subject } from 'rxjs';
import { AIProvider, AIResponse } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private client: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('API_KEY');
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<AIResponse> {
    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      return { text: response.text || '' };
    } catch (error) {
      this.logger.error('Gemini generateText failed', error);
      throw error;
    }
  }

  generateStream(prompt: string, systemInstruction?: string): Observable<string> {
    const subject = new Subject<string>();

    (async () => {
      try {
        const streamResult = await this.client.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

        for await (const chunk of streamResult) {
          if (chunk.text) {
            subject.next(chunk.text);
          }
        }
        subject.complete();
      } catch (error) {
        this.logger.error('Gemini generateStream failed', error);
        subject.error(error);
      }
    })();

    return subject.asObservable();
  }
}