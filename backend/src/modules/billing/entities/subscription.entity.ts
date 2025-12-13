import { SubscriptionStatus, SubscriptionTier } from "../../users/entities/user.entity";

export class Subscription {
  userId: string;
  tier: SubscriptionTier;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;

  constructor(partial: Partial<Subscription>) {
    Object.assign(this, partial);
  }
}