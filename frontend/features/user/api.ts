import { apiClient } from "@/lib/api-client";
import { UpdatePreferencesPayload, UpdateProfilePayload, User } from "./types";

export const userApi = {
  getProfile: () => apiClient<User>('/users/me'),
  
  updateProfile: (data: UpdateProfilePayload) => 
    apiClient<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updatePreferences: (data: UpdatePreferencesPayload) => 
    apiClient<User>('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
