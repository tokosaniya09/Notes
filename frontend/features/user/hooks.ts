import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "./api";
import { UpdatePreferencesPayload, UpdateProfilePayload } from "./types";
import { toast } from "sonner";

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: userApi.getProfile,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully");
      queryClient.setQueryData(['user'], updatedUser);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesPayload) => userApi.updatePreferences(data),
    onSuccess: (updatedUser) => {
      toast.success("Preferences saved");
      queryClient.setQueryData(['user'], updatedUser);
    },
    onError: (error: Error) => {
        toast.error(error.message || "Failed to save preferences");
    },
  });
}
