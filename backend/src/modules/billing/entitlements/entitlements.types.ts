import { SubscriptionTier } from '../../users/entities/user.entity';

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

export const PLAN_LIMITS: Record<SubscriptionTier, Entitlements['features']> = {
  [SubscriptionTier.FREE]: {
    aiRequestLimitPerDay: 5,
    maxStorageBytes: 100 * 1024 * 1024, // 100MB
    canUseCollaboration: true,
    canEditCollaboration: false,
    canUseAdvancedAI: false,
  },
  [SubscriptionTier.PRO]: {
    aiRequestLimitPerDay: 100,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10GB
    canUseCollaboration: true,
    canEditCollaboration: true,
    canUseAdvancedAI: true,
  },
  [SubscriptionTier.TEAM]: {
    aiRequestLimitPerDay: 9999, // Unlimited effectively
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100GB
    canUseCollaboration: true,
    canEditCollaboration: true,
    canUseAdvancedAI: true,
  },
};