"use client";

import React, { useEffect, useState, useRef } from "react";
import { useNote, useUpdateNote, useDeleteNote } from "../hooks";
import { useEditorStore } from "../store";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Trash, ChevronLeft, Cloud, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";
import { ConfirmDialog } from "../components/confirm-dialog";

// Collaboration Imports
import { useCollaboration, useCursorBroadcaster } from "@/features/collaboration/hooks";
import { PresenceAvatars } from "@/features/collaboration/components/presence-avatars";
import { CursorOverlay } from "@/features/collaboration/components/cursor-overlay";

// AI Imports
import { AIToolbar } from "@/components/editor/ai-toolbar";
import { AIPanel, AIMode } from "@/features/ai/components/ai-panel";

interface EditorProps {
  noteId: string;
}

export function Editor({ noteId }: EditorProps) {
  const { data: note, isLoading } = useNote(noteId);
  const { mutate: updateNote } = useUpdateNote(noteId);
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote();
  
  const { setSaving, isSaving, setLastSaved } = useEditorStore();

  // Collaboration Hooks
  useCollaboration(noteId);
  const broadcastCursor = useCursorBroadcaster(noteId);

  // Local state for immediate typing feedback
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // AI State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiMode, setAIMode] = useState<AIMode>("idle");

  // Refs
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize state when data loads
  useEffect(() => {
    if (note && !isInitialized) {
      setTitle(note.title);
      setContent(note.content?.text || "");
      setIsInitialized(true);
    }
  }, [note, isInitialized]);

  // Autosave Logic
  const handleChange = (newTitle: string, newContent: string) => {
    setTitle(newTitle);
    setContent(newContent);
    setSaving(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateNote(
        { 
          title: newTitle, 
          content: { text: newContent } // Simple schema for MVP
        },
        {
          onSuccess: () => {
            setSaving(false);
            setLastSaved(new Date());
          }
        }
      );
    }, 5000); // 5 second debounce
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    broadcastCursor(target.selectionStart);
  };

  const handleAIAction = (mode: AIMode) => {
    setAIMode(mode);
    setIsAIOpen(true);
  };

  const handleDelete = () => {
    deleteNote(noteId);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!note) return <div>Note not found</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content Area */}
      <FadeIn className="flex-1 flex flex-col h-full relative border border-black/10 rounded-lg shadow-sm bg-card">
        <div className="w-full px-8 md:px-12 py-6 mx-auto">
          
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8 py-2">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                    {isSaving ? "Saving..." : <span className="flex items-center gap-1"><Cloud className="h-3 w-3" /> <Check className="h-2 w-2" /> Saved</span>}
                </span>
                <div className="h-4 w-[1px] bg-border mx-1" />
                <PresenceAvatars />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AIToolbar isOpen={isAIOpen} onAction={handleAIAction} />
              <div className="h-4 w-[1px] bg-border mx-1" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange(e.target.value, content)}
            placeholder="Untitled Note"
            className="w-full bg-transparent text-4xl font-bold tracking-tight border-none focus:outline-none placeholder:text-muted-foreground/40 mb-6"
          />

          {/* Main Editor Area with Overlay */}
          <div className="relative min-h-[500px] flex flex-col">
            <CursorOverlay content={content} textareaRef={textareaRef} />
            
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                handleChange(title, e.target.value);
                broadcastCursor(e.target.selectionStart);
              }}
              onSelect={handleSelect}
              onClick={handleSelect}
              onKeyUp={handleSelect}
              placeholder="Start writing..."
              className={cn(
                "w-full flex-1 resize-none bg-transparent text-lg leading-relaxed border-none focus:outline-none placeholder:text-muted-foreground/30",
                "font-serif relative z-10"
              )}
              spellCheck={false}
            />
          </div>
        </div>
      </FadeIn>

      {/* AI Panel (Right Side) */}
      {isAIOpen && (
        <AIPanel 
           isOpen={isAIOpen} 
           onClose={() => setIsAIOpen(false)} 
           mode={aiMode}
           setMode={setAIMode}
           contextContent={content}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        variant="destructive"
        actionLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}