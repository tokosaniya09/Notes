import { Entitlements } from "../entitlements/entitlements.types";

export class BillingResponseDto {
  subscription: {
    tier: string;
    status: string;
    endsAt: Date | null;
  };
  entitlements: Entitlements;
  portalUrl?: string;
}