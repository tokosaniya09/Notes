import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "./api";
import { CreateCheckoutPayload } from "./types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: billingApi.getSubscription,
    // Critical: Do not cache subscription status too long to avoid stale UI after checkout
    staleTime: 0, 
    retry: 1,
  });
}

export function useCheckout() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateCheckoutPayload) => billingApi.createCheckoutSession(data),
    onSuccess: (data) => {
      // Redirect to Stripe
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate checkout");
    },
  });
}

export function usePortal() {
  return useMutation({
    mutationFn: () => billingApi.createPortalSession(),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to load billing portal");
    },
  });
}
