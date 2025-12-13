export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface SummarizeRequest {
  content: string;
  format?: 'paragraph' | 'bullet-points' | 'executive-summary';
}

export interface RewriteRequest {
  content: string;
  instruction: string;
}

export interface AskRequest {
  context: string;
  question: string;
  tone?: string;
}
