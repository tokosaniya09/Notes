"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  actionLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  actionLabel = "Continue",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="relative z-50 grid w-full max-w-md mx-4 gap-4 border bg-card p-6 shadow-lg sm:rounded-lg animate-in zoom-in-95 fade-in duration-200 slide-in-from-bottom-10 sm:slide-in-from-bottom-0"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 id="confirm-dialog-title" className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h3>
          <p id="confirm-dialog-desc" className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="mt-2 sm:mt-0"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}