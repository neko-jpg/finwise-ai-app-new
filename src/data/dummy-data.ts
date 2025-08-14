
import type { Category, QuickActionDefinition, Goal } from '@/lib/types';
import { Coffee, ShoppingBasket, Bus, Gamepad2, Zap, Bell, Rocket, Target, Wallet } from "lucide-react";
import React from 'react';

export interface DummyTransaction {
    id: number;
    cat: string;
    name: string;
    amount: number;
    date: string;
}

export const CATEGORIES: Category[] = [
  { key: "food", label: "食費", icon: React.createElement(Coffee, {className: "h-4 w-4"}) },
  { key: "daily", label: "日用品", icon: React.createElement(ShoppingBasket, {className: "h-4 w-4"}) },
  { key: "trans", label: "交通費", icon: React.createElement(Bus, {className: "h-4 w-4"}) },
  { key: "fun", label: "娯楽", icon: React.createElement(Gamepad2, {className: "h-4 w-4"}) },
  { key: "util", label: "光熱費", icon: React.createElement(Zap, {className: "h-4 w-4"}) },
  { key: "income", label: "収入", icon: React.createElement(Wallet, {className: "h-4 w-4"}) },
  { key: "other", label: "その他", icon: React.createElement(Rocket, {className: "h-4 w-4"}) },
];

export const DEMO_TRANSACTIONS: DummyTransaction[] = [
  { id: 1, cat: "food", name: "カフェラテ", amount: -580, date: "2025-08-13" },
  { id: 2, cat: "trans", name: "地下鉄", amount: -210, date: "2025-08-13" },
  { id: 3, cat: "food", name: "学食ランチ", amount: -480, date: "2025-08-12" },
  { id: 4, cat: "fun", name: "映画学割", amount: -1200, date: "2025-08-11" },
  { id: 5, cat: "util", name: "電気料金", amount: -4200, date: "2025-08-10" },
  { id: 6, cat: "daily", name: "ティッシュペーパー", amount: -300, date: "2025-08-10" },
  { id: 7, cat: "food", name: "コンビニ弁当", amount: -650, date: "2025-08-09" },
  { id: 8, cat: "trans", name: "バス料金", amount: -220, date: "2025-08-09" },
];

export const DEMO_GOALS: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        name: '台湾旅行',
        target: 150000,
        saved: 65000,
        due: new Date('2026-03-31'),
    },
    {
        name: '新しいPC',
        target: 280000,
        saved: 120000,
        due: null,
    }
]


export const INITIAL_BUDGET = {
  food: { limit: 25000, used: 11250 },
  daily: { limit: 8000, used: 3200 },
  trans: { limit: 7000, used: 1800 },
  fun: { limit: 15000, used: 9500 },
  util: { limit: 12000, used: 4200 },
  income: { limit: 0, used: 0 },
  other: { limit: 5000, used: 0 },
};

export const QUICK_ACTIONS: QuickActionDefinition[] = [
    { key: "detect_subscription", text: "無駄サブスク検知", icon: Bell },
    { key: "review_fixed_costs", text: "固定費レビュー", icon: Rocket },
    { key: "create_goal", text: "目標を作成", icon: Target },
    { key: "link_bank", text: "口座を連携", icon: Wallet },
];
