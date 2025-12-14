import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "./api";
import { CreateNoteDto, NotesListParams, UpdateNoteDto, Note } from "./types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useNotes(params?: NotesListParams) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => notesApi.getAll(params),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => notesApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateNoteDto) => notesApi.create(data),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      if (newNote && newNote.id) {
        toast.success("Note created");
        router.push(`/dashboard/notes/${newNote.id}`);
      } else {
        console.error("Note created but no ID returned", newNote);
        toast.error("Note created but failed to open");
      }
    },
    onError: (error) => {
      console.error("Create note failed", error);
      toast.error("Failed to create note. Please try again.");
    },
  });
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNoteDto) => notesApi.update(id, data),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["note", id] });

      // Snapshot the previous value
      const previousNote = queryClient.getQueryData<Note>(["note", id]);

      // Optimistically update to the new value
      if (previousNote) {
        queryClient.setQueryData<Note>(["note", id], {
          ...previousNote,
          ...newData,
        });
      }

      return { previousNote };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["note", id], context?.previousNote);
      toast.error("Failed to save changes");
    },
    onSuccess: () => {
      // We do NOT invalidate queries immediately on autosave to prevent 
      // the UI from re-fetching and resetting cursor position or focus.
      // We rely on the mutation result to be accurate enough.
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
      router.push("/dashboard");
    },
  });
}