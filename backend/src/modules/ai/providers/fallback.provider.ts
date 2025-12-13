import { Injectable, Logger } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { delay, concatMap } from 'rxjs/operators';
import { AIProvider, AIResponse } from './ai-provider.interface';

@Injectable()
export class FallbackProvider implements AIProvider {
  private readonly logger = new Logger(FallbackProvider.name);

  async generateText(prompt: string): Promise<AIResponse> {
    this.logger.warn('Using Fallback AI Provider');
    return {
      text: `[FALLBACK] Processed: ${prompt.substring(0, 50)}...`,
    };
  }

  generateStream(prompt: string): Observable<string> {
    this.logger.warn('Using Fallback AI Provider Stream');
    const chunks = ['[FALLBACK] ', 'Processing ', 'stream ', 'for: ', prompt.substring(0, 20), '...'];
    
    // Simulate streaming delay
    return from(chunks).pipe(
      concatMap(item => from([item]).pipe(delay(100)))
    );
  }
}