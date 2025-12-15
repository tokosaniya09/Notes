import { useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { aiApi } from "./api";
import { AskRequest, RewriteRequest, SummarizeRequest } from "./types";
import { toast } from "sonner";
import { getSession } from "next-auth/react";

export function useSummarize() {
  return useMutation({
    mutationFn: (data: SummarizeRequest) => aiApi.summarize(data),
    onError: () => toast.error("Failed to summarize note"),
  });
}

export function useRewrite() {
  return useMutation({
    mutationFn: (data: RewriteRequest) => aiApi.rewrite(data),
    onError: () => toast.error("Failed to rewrite content"),
  });
}

/**
 * Hook to handle streaming responses from the NestJS SSE endpoint.
 * Manages the buffer, loading state, and abort controller.
 */
export function useAIStream() {
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamAsk = useCallback(async (payload: AskRequest) => {
    setIsLoading(true);
    setData(""); // Reset buffer
    
    // Cancel previous request if active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const session = await getSession();
      // @ts-ignore
      const token = session?.accessToken;

      // Direct fetch to handle stream
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/ai/stream/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // NestJS SSE format: `data: {"text":"..."}\n\n`
        // We need to parse these distinct lines
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim();
              if (jsonStr) {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) {
                  setData((prev) => prev + parsed.text);
                }
              }
            } catch (e) {
              console.warn("Failed to parse SSE chunk", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error("AI connection interrupted");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    streamAsk,
    stop,
    reset: () => setData(""),
  };
}