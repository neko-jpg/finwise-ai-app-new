
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export interface Category {
  key: string;
  label: string;
  icon: React.ReactElement;
}

export interface Transaction {
  id: string; // Firestore document ID
  bookedAt: Date;
  amount: number; // Value in the user's primary currency (e.g., JPY)
  originalAmount: number;
  originalCurrency: string; // 3-letter currency code (e.g., 'USD')
  merchant: string;
  category: {
    major: string;
    minor?: string;
    confidence?: number;
  };
  source: 'manual' | 'voice' | 'ocr' | 'csv';
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
  deletedAt?: Timestamp | null; // For soft deletes
  // For family sharing
  scope?: 'personal' | 'shared';
  createdBy?: string; // UID of the user who created the transaction
}

export interface BudgetItem {
  limit: number;
  used: number;
}

export interface Budget {
  id: string; // YYYY-MM
  limits: { [categoryKey: string]: number };
  used: { [categoryKey: string]: number };
  suggestedByAI?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Goal {
    id: string; // Firestore document ID
    name: string;
    target: number;
    saved: number;
    due: Date | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    // For family sharing
    scope?: 'personal' | 'shared';
    createdBy?: string; // UID of the user who created the goal
}

export interface QuickActionDefinition {
    key: string;
    text: string;
    icon: LucideIcon;
}

// For Plaid Integration
export interface PlaidItem {
    id: string; // Firestore document ID
    familyId: string;
    accessToken: string;
    institutionName: string;
    createdAt: Timestamp;
}

export interface InvestmentAccount {
    id: string; // Firestore document ID, same as Plaid account_id
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
    id: string; // Firestore document ID, composite key like ${accountId}-${securityId}
    familyId: string;
    plaidAccountId: string;
    securityId: string;
    quantity: number;
    institutionValue: number;
    costBasis: number | null;
    updatedAt: Timestamp;
}

export interface Security {
    id: string; // Firestore document ID, same as Plaid security_id
    name: string | null;
    tickerSymbol: string | null;
    type: string | null;
    closePrice: number | null;
    updatedAt: Timestamp;
}
