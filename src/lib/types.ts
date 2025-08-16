import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export interface Category {
  key: string;
  label: string;
  icon: React.ReactElement;
}

export interface Transaction {
  id: string;
  bookedAt: Date;
  amount: number;
  originalAmount: number;
  originalCurrency: string;
  merchant: string;
  category: {
    major: string;
    minor?: string;
    confidence?: number;
  };
  source: 'manual' | 'voice' | 'ocr' | 'csv' | 'plaid';
  note?: string;
  attachment?: {
    filePath: string;
    mime: string;
  };
  recurring?: {
    interval: 'weekly' | 'monthly' | 'yearly';
    anchor?: Date;
  };
  hash: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  clientUpdatedAt: Date;
  deletedAt?: Timestamp | null;
  familyId: string;
  scope?: 'personal' | 'shared';
  createdBy?: string;
  taxTag?: string;
  plaidTransactionId?: string;
  plaidAccountId?: string;
}

// 修正点: `targetAmount`を`target`に、`currentAmount`を`saved`に修正しました
export interface Goal {
  id: string;
  familyId: string;
  name: string;
  target: number;
  saved: number;
  due: Date | null; // TimestampからDateに変更
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  scope: 'personal' | 'shared';
}

export interface Budget {
    id: string;
    familyId: string;
    year: number;
    month: number;
    limits: { [key: string]: number };
    used: { [key: string]: number };
    scope: 'personal' | 'shared';
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ... (残りの型定義は変更なし)
export interface QuickActionDefinition {
    key: string;
    text: string;
    icon: LucideIcon;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    primaryCurrency: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    hasCompletedOnboarding?: boolean;
}

export interface Family {
    id: string;
    name: string;
    members: string[];
    admins: string[];
    createdAt: Timestamp;
}

export interface PlaidItem {
    id: string;
    familyId: string;
    userId: string;
    accessToken: string;
    institutionId: string;
    institutionName: string;
    updatedAt: Timestamp;
}

export interface Account {
    id: string;
    familyId: string;
    plaidItemId: string;
    name: string;
    mask: string | null;
    type: string;
    subtype: string;
    currentBalance: number;
    updatedAt: Timestamp;
}

export interface Holding {
    id: string;
    familyId: string;
    userId: string;
    securityId: string;
    quantity: number;
    plaidAccountId?: string;
    institutionValue?: number;
    costBasis?: number | null;
    notes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Security {
    id:string;
    assetType: 'stock' | 'crypto';
    name: string | null;
    tickerSymbol: string | null;
    securityType?: string | null;
    closePrice: number | null;
    logoUrl?: string;
    updatedAt: Timestamp;
}

export interface Dividend {
  id: string;
  familyId: string;
  securityId: string;
  exDate: Timestamp;
  paymentDate: Timestamp;
  amount: number;
  currency: string;
  createdAt: Timestamp;
}

export interface Rule {
  id: string;
  name: string;
  priority: number;
  trigger: {
    field: 'merchant' | 'amount';
    operator: 'contains' | 'equals' | 'greater_than' | 'less_than';
    value: string | number;
  };
  action: {
    field: 'category'; // Changed from 'type' for clarity
    value: string;
  };
  uid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
}

export interface Notification {
  id: string;
  familyId: string;
  userId?: string;
  type: 'overspending_alert' | 'bill_reminder' | 'generic';
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
  link?: string;
}

export type WidgetId = 'todaySpend' | 'monthlyBudget' | 'advice' | 'quickActions' | 'goals' | 'recentTransactions';

export interface WidgetConfig {
    id: WidgetId;
    order: number;
    size: 'full' | 'half' | 'third';
}

export interface DashboardLayout {
    id: string; // Should be user's UID
    widgets: WidgetConfig[];
}
