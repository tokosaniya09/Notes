import { apiClient } from "@/lib/api-client";
import { BillingResponse, CreateCheckoutPayload } from "./types";

const BASE_URL = "/billing";

export const billingApi = {
  getSubscription: () => 
    apiClient<BillingResponse>(`${BASE_URL}/subscription`),

  createCheckoutSession: (data: CreateCheckoutPayload) =>
    apiClient<{ url: string }>(`${BASE_URL}/checkout`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createPortalSession: () =>
    apiClient<{ url: string }>(`${BASE_URL}/portal`, {
      method: "POST",
    }),
};
