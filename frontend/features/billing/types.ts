export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  TEAM = 'TEAM',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete',
  TRIALING = 'trialing',
}

export interface Entitlements {
  tier: SubscriptionTier;
  features: {
    aiRequestLimitPerDay: number;
    maxStorageBytes: number;
    canUseCollaboration: boolean;
    canEditCollaboration: boolean;
    canUseAdvancedAI: boolean;
  };
}

export interface BillingResponse {
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus | string;
    endsAt: string | null;
  };
  entitlements: Entitlements;
  portalUrl?: string;
}

export interface CreateCheckoutPayload {
  tier: SubscriptionTier;
  successUrl?: string;
  cancelUrl?: string;
}
