export type ActiveTab = 
  | 'landing' 
  | 'architecture' 
  | 'pricing' 
  | 'contact' 
  | 'design-system'
  | 'auth'
  | 'onboarding'
  | 'portal'
  | 'account'
  | 'admin';

export type WorkspaceRoutine = 'desk' | 'moderate' | 'athletic';

export interface BiometricState {
  massKg: number;
  terminalHours: number;
  temperatureC: number;
  humidityPct: number;
}

export interface IntakeLog {
  id: string;
  amountMl: number;
  timestamp: Date;
  label: string;
}

export interface ProformaData {
  companyName: string;
  gstin: string;
  address: string;
  seats: number;
  unitPrice: number;
  discountPct: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  invoiceNumber: string;
  invoiceDate: string;
}

export interface WebUser {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  plan: string;
  isPro?: boolean;
  allowedFeatures?: string[];
  onboarding?: {
    age?: number;
    weight?: number;
    height?: number;
    medicalInfo?: string;
    dailyGoal?: number;
    reminderInterval?: number;
    notificationTheme?: string;
    notificationPosition?: string;
  };
  createdAt?: string;
}

export interface HourlyActivityPoint {
  label: string;
  volume: number;
}

export interface AdminStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalRevenue: number;
  currency: string;
  currencySymbol: string;
  totalLogs: number;
  totalLitersDrank: string;
  activeHydratorsToday: number;
  totalInquiries: number;
  hourlyActivity?: HourlyActivityPoint[];
}

export interface UserInquiry {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'In Review' | 'Resolved';
  createdAt: string;
}

export interface FeatureItem {
  id: string;
  name: string;
  description: string;
  includedInFree: boolean;
  includedInPro: boolean;
  category: string;
}

export interface PricingConfig {
  _id?: string;
  planName: string;
  editionName: string;
  freePlanName?: string;
  price: number;
  billingInterval?: string;
  currency: string;
  currencySymbol: string;
  gstPercent: number;
  features: FeatureItem[];
  updatedAt?: string;
}
