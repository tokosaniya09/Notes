export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PRO' | 'TEAM';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  [key: string]: any;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UpdatePreferencesPayload {
  preferences: UserPreferences;
}
