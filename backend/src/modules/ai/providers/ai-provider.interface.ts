import { Observable } from 'rxjs';

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AIProvider {
  /**
   * Generates a complete text response.
   */
  generateText(prompt: string, systemInstruction?: string): Promise<AIResponse>;

  /**
   * Generates a stream of text chunks.
   */
  generateStream(prompt: string, systemInstruction?: string): Observable<string>;
}