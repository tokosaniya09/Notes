"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming generic textarea exists or standard
import { Icons } from "@/components/icons";
import { AIStream } from "./ai-stream";
import { useAIStream, useRewrite, useSummarize } from "../hooks";
import { X, Sparkles, Copy, RefreshCw, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type AIMode = "idle" | "summarize" | "rewrite" | "chat";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AIMode;
  setMode: (mode: AIMode) => void;
  contextContent: string; // The note content
}

export function AIPanel({ isOpen, onClose, mode, setMode, contextContent }: AIPanelProps) {
  // Hooks
  const { mutate: summarize, isPending: isSummarizing, data: summaryData } = useSummarize();
  const { mutate: rewrite, isPending: isRewriting, data: rewriteData } = useRewrite();
  const { data: streamData, isLoading: isStreaming, streamAsk, stop, reset: resetStream } = useAIStream();

  // Local State
  const [question, setQuestion] = useState("");
  const [instruction, setInstruction] = useState("");
  const [activeOutput, setActiveOutput] = useState("");

  // Effect: Handle Mode Changes / Triggers
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "summarize" && !activeOutput && !isSummarizing) {
       // Auto-trigger summarize if opening in that mode empty
       summarize({ content: contextContent, format: 'paragraph' }, {
         onSuccess: (data) => setActiveOutput(data.text)
       });
    }
  }, [mode, isOpen]);

  // Effect: Sync outputs to display
  useEffect(() => {
    if (summaryData) setActiveOutput(summaryData.text);
  }, [summaryData]);

  useEffect(() => {
    if (rewriteData) setActiveOutput(rewriteData.text);
  }, [rewriteData]);

  // Chat handling
  const handleAsk = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;
    
    // Switch to stream view
    setActiveOutput(""); 
    resetStream();
    
    streamAsk({
      context: contextContent,
      question: question,
    });
  };

  const handleRewrite = () => {
    if (!instruction.trim()) return;
    rewrite({ content: contextContent, instruction });
  };

  const handleCopy = () => {
    const textToCopy = isStreaming || mode === 'chat' ? streamData : activeOutput;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full border-l bg-muted/30 w-[400px] shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Assistant
          <span className="text-xs text-muted-foreground uppercase px-2 py-0.5 rounded bg-muted">
            {mode === 'idle' ? 'Ready' : mode}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* REWRITE INPUT */}
        {mode === "rewrite" && !activeOutput && !isRewriting && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm text-muted-foreground">How should I rewrite this note?</p>
            <div className="flex gap-2">
              <Input 
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g. Make it more professional"
                onKeyDown={(e) => e.key === 'Enter' && handleRewrite()}
              />
              <Button onClick={handleRewrite} disabled={!instruction}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
               <Button variant="outline" size="sm" onClick={() => setInstruction("Fix grammar and spelling")}>Fix Grammar</Button>
               <Button variant="outline" size="sm" onClick={() => setInstruction("Make it concise")}>Concise</Button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {(isSummarizing || isRewriting) && (
          <div className="flex flex-col items-center justify-center h-40 space-y-3 text-muted-foreground">
             <Icons.spinner className="h-6 w-6 animate-spin" />
             <p className="text-xs">Thinking...</p>
          </div>
        )}

        {/* OUTPUT DISPLAY (Static) */}
        {activeOutput && (mode === 'summarize' || mode === 'rewrite') && (
           <div className="animate-in fade-in zoom-in-95">
              <div className="bg-background border rounded-lg p-4 text-sm leading-relaxed shadow-sm">
                {activeOutput}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => { setActiveOutput(""); if(mode === 'rewrite') setInstruction(""); }}>
                  <RefreshCw className="h-3 w-3 mr-2" /> Try Again
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3 w-3 mr-2" /> Copy
                </Button>
              </div>
           </div>
        )}

        {/* STREAM DISPLAY (Chat) */}
        {mode === 'chat' && (
           <div className="space-y-4">
              {streamData ? (
                 <div className="bg-background border rounded-lg p-4 shadow-sm">
                   <AIStream text={streamData} isStreaming={isStreaming} />
                 </div>
              ) : !isStreaming && (
                 <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                    <Sparkles className="h-8 w-8 mb-2 opacity-20" />
                    <p>Ask me anything about your note.</p>
                 </div>
              )}
              
              {isStreaming && (
                <Button variant="destructive" size="sm" onClick={stop} className="w-full">
                  Stop Generating
                </Button>
              )}
           </div>
        )}
      </div>

      {/* CHAT INPUT */}
      {mode === 'chat' && (
        <div className="p-4 border-t bg-background/50 backdrop-blur">
          <form onSubmit={handleAsk} className="relative">
            <Input 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="pr-10"
              disabled={isStreaming}
            />
            <Button 
               type="submit" 
               size="icon" 
               variant="ghost" 
               disabled={!question || isStreaming}
               className="absolute right-0 top-0 h-full text-muted-foreground hover:text-primary"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}