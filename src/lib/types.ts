import type { LucideIcon } from 'lucide-react';

export interface Category {
  key: string;
  label: string;
  icon: React.ReactElement;
}

export interface Transaction {
  id: number;
  cat: string;
  name: string;
  amount: number;
  date: string;
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
