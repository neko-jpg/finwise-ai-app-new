import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';

// --- Core Schemas ---

// This is a "thin" user type that abstracts the differences between
// Firebase client User and admin DecodedIdToken.
export type AuthUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

export const AppUserSchema = z.object({
  uid: z.string(),
  familyId: z.string().optional(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
  primaryCurrency: z.string().default('JPY'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  hasCompletedOnboarding: z.boolean().optional(),
});
export type AppUser = z.infer<typeof AppUserSchema>;

export const FamilySchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()),
  admins: z.array(z.string()),
  createdAt: z.coerce.date(),
});
export type Family = z.infer<typeof FamilySchema>;

// ★★★ ここからが修正箇所です ★★★
// Zodスキーマからではなく、シンプルなInterfaceでTransactionの型を定義します。
// これにより、FirestoreのTimestamp型をフロントエンドで安全にDate型として扱えるようになります。
export interface Transaction {
  id: string;
  userId: string; // FirebaseのUIDと紐付けるために追加
  familyId: string;
  amount: number;
  originalAmount?: number;
  originalCurrency?: string;
  merchant: string;
  bookedAt: Date; // FirestoreのTimestampから変換されるDate型
  category: {
    major: string;
    minor?: string;
    confidence?: number;
  };
  source?: 'manual' | 'voice' | 'ocr' | 'csv' | 'plaid' | 'manual-offline';
  note?: string;
  attachment?: {
    filePath: string;
    mime: string;
  };
  recurring?: {
    interval: 'weekly' | 'monthly' | 'yearly';
    anchor?: Date;
  };
  hash?: string;
  createdAt: Date; // FirestoreのTimestampから変換されるDate型
  updatedAt: Date; // FirestoreのTimestampから変換されるDate型
  clientUpdatedAt?: Date;
  deletedAt?: Date;
  scope?: 'personal' | 'shared';
  createdBy?: string;
  taxTag?: string;
  tags?: string[];
  plaidTransactionId?: string;
  plaidAccountId?: string;
}
// ★★★ ここまでが修正箇所です ★★★

export const GoalSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  name: z.string(),
  target: z.number(),
  saved: z.number(),
  due: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string(),
  scope: z.enum(['personal', 'shared']),
});
export type Goal = z.infer<typeof GoalSchema>;

export const BudgetSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  year: z.number(),
  month: z.number(),
  limits: z.record(z.string(), z.number()),
  used: z.record(z.string(), z.number()),
  scope: z.enum(['personal', 'shared']),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Budget = z.infer<typeof BudgetSchema>;

export const RuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.number(),
  trigger: z.object({
    field: z.enum(['merchant', 'amount']),
    operator: z.enum(['contains', 'equals', 'greater_than', 'less_than']),
    value: z.union([z.string(), z.number()]),
  }),
  action: z.object({
    field: z.literal('category'),
    value: z.string(),
  }),
  uid: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});
export type Rule = z.infer<typeof RuleSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  userId: z.string().optional(),
  type: z.enum(['overspending_alert', 'bill_reminder', 'generic']),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.coerce.date(),
  link: z.string().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  type: z.enum([
    'duplicate_transactions',
    'subscription_review',
    'budget_review',
  ]),
  title: z.string(),
  description: z.string(),
  cta: z.string(),
  link: z.string(),
  data: z.any().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

// --- Plaid-related Schemas ---

export const PlaidAccountSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  plaidItemId: z.string(),
  name: z.string(),
  mask: z.string().nullable(),
  type: z.string(),
  subtype: z.string(),
  currentBalance: z.number(),
  updatedAt: z.coerce.date(),
});
export type Account = z.infer<typeof PlaidAccountSchema>;

export const HoldingSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  userId: z.string(),
  securityId: z.string(),
  quantity: z.number(),
  plaidAccountId: z.string().optional(),
  institutionValue: z.number().optional(),
  costBasis: z.number().nullable().optional(),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Holding = z.infer<typeof HoldingSchema>;

export const SecuritySchema = z.object({
  id: z.string(),
  assetType: z.enum(['stock', 'crypto']),
  name: z.string().nullable(),
  tickerSymbol: z.string().nullable(),
  securityType: z.string().nullable().optional(),
  closePrice: z.number().nullable(),
  logoUrl: z.string().url().optional(),
  updatedAt: z.coerce.date(),
});
export type Security = z.infer<typeof SecuritySchema>;

export const InvitationSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  senderId: z.string(),
  senderName: z.string().nullable(),
  recipientEmail: z.string(),
  status: z.enum(['pending', 'accepted', 'declined']),
  createdAt: z.coerce.date(),
});
export type Invitation = z.infer<typeof InvitationSchema>;

// --- UI-related Types (Not Zod Schemas as they don't come from a DB) ---

export interface Category {
  key: string;
  label: string;
  icon: React.ReactElement;
}

export interface QuickActionDefinition {
  key: string;
  text: string;
  icon: LucideIcon;
}

export type WidgetId =
  | 'todaySpend'
  | 'monthlyBudget'
  | 'advice'
  | 'quickActions'
  | 'goals'
  | 'recentTransactions';

export interface WidgetConfig {
  id: WidgetId;
  order: number;
  size: 'full' | 'half' | 'third';
}

export interface DashboardLayout {
  id: string; // Should be user's UID
  widgets: WidgetConfig[];
}

export type BadgeId = 'one_month_user' | 'first_budget_met';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface UserBadge {
  id: string; // Document ID
  userId: string;
  badgeId: BadgeId;
  createdAt: Date;
}
