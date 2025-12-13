import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface AIStreamProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function AIStream({ text, isStreaming, className }: AIStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [text, isStreaming]);

  if (!text && !isStreaming) return null;

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none leading-relaxed", className)}>
      <div className="whitespace-pre-wrap">
        {text}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse" />
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
