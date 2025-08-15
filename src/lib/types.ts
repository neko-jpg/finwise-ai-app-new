
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
  amount: number;
  currency: 'JPY' | 'USD' | 'EUR';
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
