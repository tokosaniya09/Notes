"use client";

import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  PenTool,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AIMode } from "@/features/ai/components/ai-panel";

interface AIToolbarProps {
  onAction: (mode: AIMode) => void;
  isOpen: boolean;
}

export function AIToolbar({ onAction, isOpen }: AIToolbarProps) {
  const disabledClasses = isOpen
    ? "opacity-50 pointer-events-none"
    : "opacity-100";

  return (
    <TooltipProvider delayDuration={300}>
      <>
        {/* ================= DESKTOP TOOLBAR ================= */}
        <div
          className={cn(
            "hidden md:flex items-center gap-1 p-1 bg-background border rounded-lg shadow-sm transition-opacity",
            disabledClasses
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={() => onAction("chat")}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">AI</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ask AI</TooltipContent>
          </Tooltip>

          <div className="w-[1px] h-4 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onAction("summarize")}
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Summarize</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onAction("rewrite")}
              >
                <PenTool className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rewrite</TooltipContent>
          </Tooltip>
        </div>

        {/* ================= MOBILE DROPDOWN ================= */}
        <div
          className={cn(
            "flex md:hidden",
            disabledClasses
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-purple-600"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onAction("chat")}>
                <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                Ask AI
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onAction("summarize")}>
                <FileText className="h-4 w-4 mr-2" />
                Summarize
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onAction("rewrite")}>
                <PenTool className="h-4 w-4 mr-2" />
                Rewrite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    </TooltipProvider>
  );
}
