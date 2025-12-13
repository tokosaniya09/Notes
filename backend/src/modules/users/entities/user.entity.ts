export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

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

export class User {
  id: string;
  email: string;
  password?: string | null;
  firstName: string;
  lastName?: string | null;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  
  // Subscription Fields
  tier: SubscriptionTier;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: SubscriptionStatus | null;
  subscriptionEndsAt?: Date | null;

  preferences?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}