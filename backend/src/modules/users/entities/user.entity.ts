export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  TEAM = 'TEAM',
}

export class User {
  id: string;
  email: string;
  password?: string | null;
  firstName: string;
  lastName?: string | null;
  avatar?: string | null;
  role: Role;
  tier: SubscriptionTier;
  preferences?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}