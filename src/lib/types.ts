import type { LucideIcon } from 'lucide-react';

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
  createdAt: Date;
  updatedAt: Date;
  clientUpdatedAt: Date;
}

export interface BudgetItem {
  limit: number;
  used: number;
}

export interface Budget {
  [key: string]: BudgetItem;
}

export interface Goal {
    name: string;
    target: number;
    saved: number;
    due: string;
}

export interface QuickAction {
    text: string;
    icon: LucideIcon;
}
