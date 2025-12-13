"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, FileText, PenTool, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AIMode } from "@/features/ai/components/ai-panel";

interface AIToolbarProps {
  onAction: (mode: AIMode) => void;
  isOpen: boolean;
}

export function AIToolbar({ onAction, isOpen }: AIToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn(
        "flex items-center gap-1 p-1 bg-background border rounded-lg shadow-sm transition-opacity duration-300",
        isOpen ? "opacity-50 pointer-events-none" : "opacity-100"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50" onClick={() => onAction("chat")}>
               <Sparkles className="h-4 w-4 mr-1" />
               <span className="text-xs font-medium">AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ask AI</TooltipContent>
        </Tooltip>

        <div className="w-[1px] h-4 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAction("summarize")}>
               <FileText className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Summarize</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAction("rewrite")}>
               <PenTool className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rewrite</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
