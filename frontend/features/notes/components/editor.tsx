
"use client";

import { useEffect, useState, useRef } from "react";
import { useNote, useUpdateNote, useDeleteNote } from "../hooks";
import { useEditorStore } from "../store";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Trash, ChevronLeft, CheckCloud } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

interface EditorProps {
  noteId: string;
}

export function Editor({ noteId }: EditorProps) {
  const { data: note, isLoading } = useNote(noteId);
  const { mutate: updateNote } = useUpdateNote(noteId);
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote();
  
  const { setSaving, isSaving, setLastSaved } = useEditorStore();

  // Local state for immediate typing feedback
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs for debouncing
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize state when data loads
  useEffect(() => {
    if (note && !isInitialized) {
      setTitle(note.title);
      // Handle simple text extraction from JSON structure
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
    }, 2000); // 2 second debounce
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
    <FadeIn className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8 py-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs text-muted-foreground">
             {isSaving ? "Saving..." : <span className="flex items-center gap-1"><CheckCloud className="h-3 w-3" /> Saved</span>}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (confirm("Are you sure you want to delete this note?")) {
              deleteNote(noteId);
            }
          }}
          className="text-muted-foreground hover:text-destructive transition-colors"
          disabled={isDeleting}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleChange(e.target.value, content)}
        placeholder="Untitled Note"
        className="w-full bg-transparent text-4xl font-bold tracking-tight border-none focus:outline-none placeholder:text-muted-foreground/40 mb-6"
      />

      {/* Main Editor Area */}
      <textarea
        value={content}
        onChange={(e) => handleChange(title, e.target.value)}
        placeholder="Start writing..."
        className={cn(
          "w-full flex-1 resize-none bg-transparent text-lg leading-relaxed border-none focus:outline-none placeholder:text-muted-foreground/30",
          "font-serif" // Optional: using a serif font for writing feels nice
        )}
        spellCheck={false}
      />
    </FadeIn>
  );
}
