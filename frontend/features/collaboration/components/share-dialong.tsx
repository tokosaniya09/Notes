
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Globe, Copy, Check, Lock } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isShared: boolean;
  onToggleShare: (shared: boolean) => void;
  isLoading: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  isShared,
  onToggleShare,
  isLoading,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="relative z-50 grid mx-4 gap-4 border bg-card p-6 shadow-lg sm:rounded-lg animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Share Note
          </h3>
          <p className="text-sm text-muted-foreground">
            {isShared 
              ? "This note is publicly accessible to anyone with the link." 
              : "This note is currently private."}
          </p>
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center space-x-2 rounded-md border p-4 bg-muted/20">
              {isShared ? <Globe className="h-5 w-5 text-blue-500" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {isShared ? "Public Access" : "Private Access"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isShared ? "Anyone with the link can view and edit." : "Only you can view and edit this note."}
                </p>
              </div>
            </div>
            
            {isShared && (
               <div className="flex items-center space-x-2 mt-2">
                 <div className="flex-1 h-9 rounded-md border bg-muted px-3 py-2 text-xs text-muted-foreground truncate select-all">
                    {window.location.href}
                 </div>
                 <Button size="icon" variant="outline" className="h-9 w-9" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                 </Button>
               </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            variant={isShared ? "destructive" : "default"}
            onClick={() => onToggleShare(!isShared)}
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {isShared ? "Make Private" : "Make Public"}
          </Button>
        </div>
      </div>
    </div>
  );
}
