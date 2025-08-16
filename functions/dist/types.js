"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationSchema = exports.SecuritySchema = exports.HoldingSchema = exports.PlaidAccountSchema = exports.TaskSchema = exports.NotificationSchema = exports.RuleSchema = exports.BudgetSchema = exports.GoalSchema = exports.TransactionSchema = exports.FamilySchema = exports.AppUserSchema = void 0;
const zod_1 = require("zod");
// --- Core Schemas ---
exports.AppUserSchema = zod_1.z.object({
    uid: zod_1.z.string(),
    familyId: zod_1.z.string().optional(),
    email: zod_1.z.string().email().nullable(),
    displayName: zod_1.z.string().nullable(),
    photoURL: zod_1.z.string().url().nullable(),
    primaryCurrency: zod_1.z.string().default('JPY'),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    hasCompletedOnboarding: zod_1.z.boolean().optional(),
});
exports.FamilySchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    members: zod_1.z.array(zod_1.z.string()),
    admins: zod_1.z.array(zod_1.z.string()),
    createdAt: zod_1.z.coerce.date(),
});
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    familyId: zod_1.z.string(),
    amount: zod_1.z.number(),
    originalAmount: zod_1.z.number(),
    originalCurrency: zod_1.z.string(),
    merchant: zod_1.z.string(),
    bookedAt: zod_1.z.coerce.date(),
    category: zod_1.z.object({
        major: zod_1.z.string(),
        minor: zod_1.z.string().optional(),
        confidence: zod_1.z.number().optional(),
    }),
    source: zod_1.z.enum(['manual', 'voice', 'ocr', 'csv', 'plaid', 'manual-offline']),
    note: zod_1.z.string().optional(),
    attachment: zod_1.z.object({
        filePath: zod_1.z.string(),
        mime: zod_1.z.string(),
    }).optional(),
    recurring: zod_1.z.object({
        interval: zod_1.z.enum(['weekly', 'monthly', 'yearly']),
        anchor: zod_1.z.coerce.date().optional(),
    }).optional(),
    hash: zod_1.z.string(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    clientUpdatedAt: zod_1.z.coerce.date().optional(),
    deletedAt: zod_1.z.date().optional(), // No coerce, allows undefined
    scope: zod_1.z.enum(['personal', 'shared']).optional(),
    createdBy: zod_1.z.string().optional(),
    taxTag: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    plaidTransactionId: zod_1.z.string().optional(),
    plaidAccountId: zod_1.z.string().optional(),
});
exports.GoalSchema = zod_1.z.object({
    id: zod_1.z.string(),
    familyId: zod_1.z.string(),
    name: zod_1.z.string(),
    target: zod_1.z.number(),
    saved: zod_1.z.number(),
    due: zod_1.z.coerce.date().nullable(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    createdBy: zod_1.z.string(),
    scope: zod_1.z.enum(['personal', 'shared']),
});
exports.BudgetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    familyId: zod_1.z.string(),
    year: zod_1.z.number(),
    month: zod_1.z.number(),
    limits: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    used: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    scope: zod_1.z.enum(['personal', 'shared']),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.RuleSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    priority: zod_1.z.number(),
    trigger: zod_1.z.object({
        field: zod_1.z.enum(['merchant', 'amount']),
        operator: zod_1.z.enum(['contains', 'equals', 'greater_than', 'less_than']),
        value: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    }),
    action: zod_1.z.object({
        field: zod_1.z.literal('category'),
        value: zod_1.z.string(),
    }),
    uid: zod_1.z.string(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
    deletedAt: zod_1.z.coerce.date().nullable(),
});
exports.NotificationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    familyId: zod_1.z.string(),
    userId: zod_1.z.string().optional(),
    type: zod_1.z.enum(['overspending_alert', 'bill_reminder', 'generic']),
    message: zod_1.z.string(),
    isRead: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
    link: zod_1.z.string().optional(),
});
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['duplicate_transactions', 'subscription_review', 'budget_review']),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    cta: zod_1.z.string(),
    link: zod_1.z.string(),
    data: zod_1.z.any().optional(),
});
// --- Plaid-related Schemas ---
exports.PlaidAccountSchema = zod_1.z.object({
    id: zod_1.z.string(),
    familyId: zod_1.z.string(),
    plaidItemId: zod_1.z.string(),
    name: zod_1.z.string(),
    mask: zod_1.z.string().nullable(),
    type: zod_1.z.string(),
    subtype: zod_1.z.string(),
    currentBalance: zod_1.z.number(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.HoldingSchema = zod_1.z.object({
    id: zod_1.z.string(),
    familyId: zod_1.z.string(),
    userId: zod_1.z.string(),
    securityId: zod_1.z.string(),
    quantity: zod_1.z.number(),
    plaidAccountId: zod_1.z.string().optional(),
    institutionValue: zod_1.z.number().optional(),
    costBasis: zod_1.z.number().nullable().optional(),
    notes: zod_1.z.string().optional(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.SecuritySchema = zod_1.z.object({
    id: zod_1.z.string(),
    assetType: zod_1.z.enum(['stock', 'crypto']),
    name: zod_1.z.string().nullable(),
    tickerSymbol: zod_1.z.string().nullable(),
    securityType: zod_1.z.string().nullable().optional(),
    closePrice: zod_1.z.number().nullable(),
    logoUrl: zod_1.z.string().url().optional(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.InvitationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    familyId: zod_1.z.string(),
    senderId: zod_1.z.string(),
    senderName: zod_1.z.string().nullable(),
    recipientEmail: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'accepted', 'declined']),
    createdAt: zod_1.z.coerce.date(),
});
