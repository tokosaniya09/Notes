import { apiClient } from "@/lib/api-client";
import { AIResponse, AskRequest, RewriteRequest, SummarizeRequest } from "./types";

const BASE_URL = "/ai";

export const aiApi = {
  summarize: (data: SummarizeRequest) =>
    apiClient<AIResponse>(`${BASE_URL}/summarize`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  rewrite: (data: RewriteRequest) =>
    apiClient<AIResponse>(`${BASE_URL}/rewrite`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  ask: (data: AskRequest) =>
    apiClient<AIResponse>(`${BASE_URL}/ask`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  // Streaming helper is handled in the hook due to ReadableStream complexity
};
