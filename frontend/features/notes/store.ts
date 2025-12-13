
import { create } from 'zustand';

interface EditorState {
  isSaving: boolean;
  lastSavedAt: Date | null;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isSaving: false,
  lastSavedAt: null,
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSavedAt: date }),
}));
