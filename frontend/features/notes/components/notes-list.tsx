
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, Plus } from "lucide-react";
import { useNotes, useCreateNote } from "../hooks";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

export function NotesList() {
  const { data: notes, isLoading } = useNotes();
  const { mutate: createNote, isPending: isCreating } = useCreateNote();

  if (isLoading) {
    return <NotesSkeleton />;
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 text-center">
        <div className="p-4 bg-muted rounded-full">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">No notes yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Create your first note to start capturing your ideas in a distraction-free environment.
          </p>
        </div>
        <Button onClick={() => createNote({})} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          Create Note
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Notes</h2>
        <Button onClick={() => createNote({})} disabled={isCreating} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note, i) => (
          <FadeIn key={note.id} delay={i * 0.05}>
            <Link href={`/dashboard/notes/${note.id}`}>
              <div className="group relative flex flex-col justify-between h-48 p-6 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                <div className="space-y-2">
                  <h3 className={cn(
                    "font-semibold leading-none tracking-tight line-clamp-1",
                    !note.title && "text-muted-foreground italic"
                  )}>
                    {note.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                    {/* Simplified content preview for now since it's JSON */}
                    {note.content?.text || "No additional text"}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-auto">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function NotesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
         <div className="h-8 w-32 bg-muted rounded animate-pulse" />
         <div className="h-9 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-xl border bg-card p-6 space-y-4">
            <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
