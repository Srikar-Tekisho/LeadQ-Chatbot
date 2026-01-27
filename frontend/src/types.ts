export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  USER = 'User (Employee)'
}

export enum Tab {
  PROFILE = 'Profile',
  NOTIFICATIONS = 'Notifications',
  SECURITY = 'Security',
  PLANS_BILLING = 'Plans & Billing',
  ADMIN = 'Admin Control',
  REFERRAL = 'Referral',
  HELP = 'Help & Support',
  VOICE_INTEGRATION = 'Voice Integration',
  ABOUT = 'About'
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

export interface CompanyProfile {
  name: string;
  website: string;
  address: string;
  intro: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile';
}