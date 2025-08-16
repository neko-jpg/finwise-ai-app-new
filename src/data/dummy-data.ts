import { Category, QuickActionDefinition, Goal, Transaction } from '@/lib/domain';
import { Coffee, ShoppingBasket, Bus, Gamepad2, Zap, Bell, Rocket, Target, Wallet, Link } from "lucide-react";
import { createElement } from 'react';
import { makeTransaction, makeGoal } from '@/lib/factory';

export const CATEGORIES: Category[] = [
  { key: "food", label: "食費", icon: createElement(Coffee, {className: "h-4 w-4"}) },
  { key: "daily", label: "日用品", icon: createElement(ShoppingBasket, {className: "h-4 w-4"}) },
  { key: "trans", label: "交通費", icon: createElement(Bus, {className: "h-4 w-4"}) },
  { key: "fun", label: "娯楽", icon: createElement(Gamepad2, {className: "h-4 w-4"}) },
  { key: "util", label: "光熱費", icon: createElement(Zap, {className: "h-4 w-4"}) },
  { key: "income", label: "収入", icon: createElement(Wallet, {className: "h-4 w-4"}) },
  { key: "other", label: "その他", icon: createElement(Rocket, {className: "h-4 w-4"}) },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  makeTransaction({ id: 'tx_1', category: {major: 'food'}, merchant: "カフェラテ", amount: -580, bookedAt: new Date("2025-08-13") }),
  makeTransaction({ id: 'tx_2', category: {major: 'trans'}, merchant: "地下鉄", amount: -210, bookedAt: new Date("2025-08-13") }),
  makeTransaction({ id: 'tx_3', category: {major: 'food'}, merchant: "学食ランチ", amount: -480, bookedAt: new Date("2025-08-12") }),
  makeTransaction({ id: 'tx_4', category: {major: 'fun'}, merchant: "映画学割", amount: -1200, bookedAt: new Date("2025-08-11") }),
  makeTransaction({ id: 'tx_5', category: {major: 'util'}, merchant: "電気料金", amount: -4200, bookedAt: new Date("2025-08-10") }),
  makeTransaction({ id: 'tx_6', category: {major: 'daily'}, merchant: "ティッシュペーパー", amount: -300, bookedAt: new Date("2025-08-10") }),
  makeTransaction({ id: 'tx_7', category: {major: 'food'}, merchant: "コンビニ弁当", amount: -650, bookedAt: new Date("2025-08-09") }),
  makeTransaction({ id: 'tx_8', category: {major: 'trans'}, merchant: "バス料金", amount: -220, bookedAt: new Date("2025-08-09") }),
];

export const DEMO_GOALS: Goal[] = [
    makeGoal({
        name: '台湾旅行',
        target: 150000,
        saved: 65000,
        due: new Date('2026-03-31'),
    }),
    makeGoal({
        name: '新しいPC',
        target: 280000,
        saved: 120000,
        due: null,
    })
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
    { key: "create_goal", text: "目標を作成", icon: Target },
    { key: "detect_subscription", text: "無駄サブスク検知", icon: Bell },
    { key: "review_fixed_costs", text: "毎週の固定費レビュー", icon: Rocket },
    { key: "link_bank", text: "銀行・カード連携", icon: Link },
];

export const TAX_TAGS = [
    { key: 'medical', label: '医療費控除' },
    { key: 'donation', label: '寄付金控除' },
    { key: 'insurance', label: '社会保険料控除' },
    { key: 'housing', label: '住宅ローン控除' },
];
