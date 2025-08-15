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
  deletedAt?: Timestamp | null; // For soft deletes
  // For family sharing
  familyId: string;
  scope?: 'personal' | 'shared';
  createdBy?: string; // UID of the user who created the transaction
  // For tax purposes
  taxTag?: string; // e.g., 'medical', 'donation'
  // For bank linking
  plaidTransactionId?: string;
  plaidAccountId?: string;
}

export interface Goal {
  id: string; // Firestore document ID
  familyId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface Budget {
    id: string; // YYYY-MM format
    familyId: string;
    year: number;
    month: number;
    totalBudget: number;
    categories: { [key: string]: number }; // e.g., { 'food': 50000, 'transport': 10000 }
    updatedAt: Timestamp;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    primaryCurrency: string; // e.g., 'JPY'
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Family {
    id: string;
    name: string;
    members: string[]; // array of UIDs
    admins: string[]; // array of UIDs
    createdAt: Timestamp;
}

export interface PlaidItem {
    id: string; // Firestore document ID, same as Plaid item_id
    familyId: string;
    userId: string;
    accessToken: string; // Encrypted
    institutionId: string;
    institutionName: string;
    updatedAt: Timestamp;
}

export interface Account {
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
    id: string; // Firestore document ID
    familyId: string;
    userId: string; // User who owns this holding
    securityId: string; // Links to the Security document
    quantity: number;
    // For stocks from Plaid
    plaidAccountId?: string;
    institutionValue?: number;
    costBasis?: number | null;
    // For manual entries
    notes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Security {
    id:string; // For stocks: Plaid security_id. For crypto: CoinGecko coin_id (e.g., 'bitcoin')
    assetType: 'stock' | 'crypto';
    name: string | null;
    tickerSymbol: string | null; // e.g., 'AAPL', 'BTC'
    securityType?: string | null; // For stocks: 'equity', 'etf'.
    closePrice: number | null; // Last known price
    logoUrl?: string; // For crypto logos
    updatedAt: Timestamp;
}

export interface Rule {
  id: string; // Firestore document ID
  name: string; // e.g., "Starbucks Coffee"
  priority: number; // To determine execution order, lower numbers first

  trigger: {
    field: 'merchant' | 'amount'; // Field to check on the transaction
    operator: 'contains' | 'equals' | 'greater_than' | 'less_than'; // The comparison to make
    value: string | number; // The value to compare against
  };

  action: {
    type: 'categorize' | 'set_scope' | 'add_tax_tag'; // The action to perform
    value: string; // The value for the action (e.g., category key, 'shared', tax tag key)
  };

  uid: string; // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
