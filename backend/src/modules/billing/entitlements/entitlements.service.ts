import { Injectable } from '@nestjs/common';
import { User, SubscriptionTier } from '../../users/entities/user.entity';
import { Entitlements, PLAN_LIMITS } from './entitlements.types';

@Injectable()
export class EntitlementsService {
  
  getEntitlements(user: User): Entitlements {
    // Fallback to FREE if undefined
    const tier = user.tier || SubscriptionTier.FREE;
    const limits = PLAN_LIMITS[tier];

    return {
      tier,
      features: limits,
    };
  }

  resolveTierFromPriceId(priceId: string, config: any): SubscriptionTier {
    if (priceId === config.STRIPE_PRICE_ID_PRO) return SubscriptionTier.PRO;
    if (priceId === config.STRIPE_PRICE_ID_TEAM) return SubscriptionTier.TEAM;
    return SubscriptionTier.FREE;
  }
}