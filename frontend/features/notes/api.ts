
import { apiClient } from "@/lib/api-client";
import { CreateNoteDto, Note, NotesListParams, UpdateNoteDto } from "./types";

const BASE_URL = "/notes";

export const notesApi = {
  getAll: (params?: NotesListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.isArchived !== undefined) searchParams.append("isArchived", String(params.isArchived));
    
    return apiClient<Note[]>(`${BASE_URL}?${searchParams.toString()}`);
  },

  getOne: (id: string) => apiClient<Note>(`${BASE_URL}/${id}`),

  create: (data: CreateNoteDto) => 
    apiClient<Note>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateNoteDto) =>
    apiClient<Note>(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<void>(`${BASE_URL}/${id}`, {
      method: "DELETE",
    }),
};
