import { z } from "zod";
export declare const AppUserSchema: z.ZodObject<{
    uid: z.ZodString;
    familyId: z.ZodOptional<z.ZodString>;
    email: z.ZodNullable<z.ZodString>;
    displayName: z.ZodNullable<z.ZodString>;
    photoURL: z.ZodNullable<z.ZodString>;
    primaryCurrency: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    hasCompletedOnboarding: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    createdAt: Date;
    updatedAt: Date;
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    primaryCurrency: string;
    familyId?: string | undefined;
    hasCompletedOnboarding?: boolean | undefined;
}, {
    createdAt: Date;
    updatedAt: Date;
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    familyId?: string | undefined;
    primaryCurrency?: string | undefined;
    hasCompletedOnboarding?: boolean | undefined;
}>;
export type AppUser = z.infer<typeof AppUserSchema>;
export declare const FamilySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    members: z.ZodArray<z.ZodString, "many">;
    admins: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    name: string;
    members: string[];
    admins: string[];
}, {
    id: string;
    createdAt: Date;
    name: string;
    members: string[];
    admins: string[];
}>;
export type Family = z.infer<typeof FamilySchema>;
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    familyId: z.ZodString;
    amount: z.ZodNumber;
    originalAmount: z.ZodNumber;
    originalCurrency: z.ZodString;
    merchant: z.ZodString;
    bookedAt: z.ZodDate;
    category: z.ZodObject<{
        major: z.ZodString;
        minor: z.ZodOptional<z.ZodString>;
        confidence: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        major: string;
        minor?: string | undefined;
        confidence?: number | undefined;
    }, {
        major: string;
        minor?: string | undefined;
        confidence?: number | undefined;
    }>;
    source: z.ZodEnum<["manual", "voice", "ocr", "csv", "plaid", "manual-offline"]>;
    note: z.ZodOptional<z.ZodString>;
    attachment: z.ZodOptional<z.ZodObject<{
        filePath: z.ZodString;
        mime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filePath: string;
        mime: string;
    }, {
        filePath: string;
        mime: string;
    }>>;
    recurring: z.ZodOptional<z.ZodObject<{
        interval: z.ZodEnum<["weekly", "monthly", "yearly"]>;
        anchor: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        interval: "weekly" | "monthly" | "yearly";
        anchor?: Date | undefined;
    }, {
        interval: "weekly" | "monthly" | "yearly";
        anchor?: Date | undefined;
    }>>;
    hash: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    clientUpdatedAt: z.ZodOptional<z.ZodDate>;
    deletedAt: z.ZodOptional<z.ZodDate>;
    scope: z.ZodOptional<z.ZodEnum<["personal", "shared"]>>;
    createdBy: z.ZodOptional<z.ZodString>;
    taxTag: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    plaidTransactionId: z.ZodOptional<z.ZodString>;
    plaidAccountId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    familyId: string;
    createdAt: Date;
    updatedAt: Date;
    amount: number;
    originalAmount: number;
    originalCurrency: string;
    merchant: string;
    bookedAt: Date;
    category: {
        major: string;
        minor?: string | undefined;
        confidence?: number | undefined;
    };
    source: "manual" | "voice" | "ocr" | "csv" | "plaid" | "manual-offline";
    hash: string;
    scope?: "personal" | "shared" | undefined;
    createdBy?: string | undefined;
    note?: string | undefined;
    attachment?: {
        filePath: string;
        mime: string;
    } | undefined;
    recurring?: {
        interval: "weekly" | "monthly" | "yearly";
        anchor?: Date | undefined;
    } | undefined;
    clientUpdatedAt?: Date | undefined;
    deletedAt?: Date | undefined;
    taxTag?: string | undefined;
    tags?: string[] | undefined;
    plaidTransactionId?: string | undefined;
    plaidAccountId?: string | undefined;
}, {
    id: string;
    familyId: string;
    createdAt: Date;
    updatedAt: Date;
    amount: number;
    originalAmount: number;
    originalCurrency: string;
    merchant: string;
    bookedAt: Date;
    category: {
        major: string;
        minor?: string | undefined;
        confidence?: number | undefined;
    };
    source: "manual" | "voice" | "ocr" | "csv" | "plaid" | "manual-offline";
    hash: string;
    scope?: "personal" | "shared" | undefined;
    createdBy?: string | undefined;
    note?: string | undefined;
    attachment?: {
        filePath: string;
        mime: string;
    } | undefined;
    recurring?: {
        interval: "weekly" | "monthly" | "yearly";
        anchor?: Date | undefined;
    } | undefined;
    clientUpdatedAt?: Date | undefined;
    deletedAt?: Date | undefined;
    taxTag?: string | undefined;
    tags?: string[] | undefined;
    plaidTransactionId?: string | undefined;
    plaidAccountId?: string | undefined;
}>;
export type Transaction = z.infer<typeof TransactionSchema>;
export declare const GoalSchema: z.ZodObject<{
    id: z.ZodString;
    familyId: z.ZodString;
    name: z.ZodString;
    target: z.ZodNumber;
    saved: z.ZodNumber;
    due: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    createdBy: z.ZodString;
    scope: z.ZodEnum<["personal", "shared"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    familyId: string;
    createdAt: Date;
    scope: "personal" | "shared";
    createdBy: string;
    updatedAt: Date;
    name: string;
    target: number;
    saved: number;
    due: Date | null;
}, {
    id: string;
    familyId: string;
    createdAt: Date;
    scope: "personal" | "shared";
    createdBy: string;
    updatedAt: Date;
    name: string;
    target: number;
    saved: number;
    due: Date | null;
}>;
export type Goal = z.infer<typeof GoalSchema>;
export declare const BudgetSchema: z.ZodObject<{
    id: z.ZodString;
    familyId: z.ZodString;
    year: z.ZodNumber;
    month: z.ZodNumber;
    limits: z.ZodRecord<z.ZodString, z.ZodNumber>;
    used: z.ZodRecord<z.ZodString, z.ZodNumber>;
    scope: z.ZodEnum<["personal", "shared"]>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    familyId: string;
    createdAt: Date;
    year: number;
    month: number;
    limits: Record<string, number>;
    used: Record<string, number>;
    scope: "personal" | "shared";
    createdBy: string;
    updatedAt: Date;
}, {
    id: string;
    familyId: string;
    createdAt: Date;
    year: number;
    month: number;
    limits: Record<string, number>;
    used: Record<string, number>;
    scope: "personal" | "shared";
    createdBy: string;
    updatedAt: Date;
}>;
export type Budget = z.infer<typeof BudgetSchema>;
export declare const RuleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    priority: z.ZodNumber;
    trigger: z.ZodObject<{
        field: z.ZodEnum<["merchant", "amount"]>;
        operator: z.ZodEnum<["contains", "equals", "greater_than", "less_than"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        value: string | number;
        field: "amount" | "merchant";
        operator: "contains" | "equals" | "greater_than" | "less_than";
    }, {
        value: string | number;
        field: "amount" | "merchant";
        operator: "contains" | "equals" | "greater_than" | "less_than";
    }>;
    action: z.ZodObject<{
        field: z.ZodLiteral<"category">;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        field: "category";
    }, {
        value: string;
        field: "category";
    }>;
    uid: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    deletedAt: z.ZodNullable<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    name: string;
    uid: string;
    priority: number;
    trigger: {
        value: string | number;
        field: "amount" | "merchant";
        operator: "contains" | "equals" | "greater_than" | "less_than";
    };
    action: {
        value: string;
        field: "category";
    };
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    name: string;
    uid: string;
    priority: number;
    trigger: {
        value: string | number;
        field: "amount" | "merchant";
        operator: "contains" | "equals" | "greater_than" | "less_than";
    };
    action: {
        value: string;
        field: "category";
    };
}>;
export type Rule = z.infer<typeof RuleSchema>;
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    familyId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["overspending_alert", "bill_reminder", "generic"]>;
    message: z.ZodString;
    isRead: z.ZodBoolean;
    createdAt: z.ZodDate;
    link: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    familyId: string;
    type: "overspending_alert" | "bill_reminder" | "generic";
    message: string;
    isRead: boolean;
    createdAt: Date;
    userId?: string | undefined;
    link?: string | undefined;
}, {
    id: string;
    familyId: string;
    type: "overspending_alert" | "bill_reminder" | "generic";
    message: string;
    isRead: boolean;
    createdAt: Date;
    userId?: string | undefined;
    link?: string | undefined;
}>;
export type Notification = z.infer<typeof NotificationSchema>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["duplicate_transactions", "subscription_review", "budget_review"]>;
    title: z.ZodString;
    description: z.ZodString;
    cta: z.ZodString;
    link: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "duplicate_transactions" | "subscription_review" | "budget_review";
    link: string;
    description: string;
    title: string;
    cta: string;
    data?: any;
}, {
    id: string;
    type: "duplicate_transactions" | "subscription_review" | "budget_review";
    link: string;
    description: string;
    title: string;
    cta: string;
    data?: any;
}>;
export type Task = z.infer<typeof TaskSchema>;
export declare const PlaidAccountSchema: z.ZodObject<{
    id: z.ZodString;
    familyId: z.ZodString;
    plaidItemId: z.ZodString;
    name: z.ZodString;
    mask: z.ZodNullable<z.ZodString>;
    type: z.ZodString;
    subtype: z.ZodString;
    currentBalance: z.ZodNumber;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    familyId: string;
    type: string;
    updatedAt: Date;
    name: string;
    plaidItemId: string;
    mask: string | null;
    subtype: string;
    currentBalance: number;
}, {
    id: string;
    familyId: string;
    type: string;
    updatedAt: Date;
    name: string;
    plaidItemId: string;
    mask: string | null;
    subtype: string;
    currentBalance: number;
}>;
export type Account = z.infer<typeof PlaidAccountSchema>;
export declare const HoldingSchema: z.ZodObject<{
    id: z.ZodString;
    familyId: z.ZodString;
    userId: z.ZodString;
    securityId: z.ZodString;
    quantity: z.ZodNumber;
    plaidAccountId: z.ZodOptional<z.ZodString>;
    institutionValue: z.ZodOptional<z.ZodNumber>;
    costBasis: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    familyId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    securityId: string;
    quantity: number;
    plaidAccountId?: string | undefined;
    institutionValue?: number | undefined;
    costBasis?: number | null | undefined;
    notes?: string | undefined;
}, {
    id: string;
    familyId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    securityId: string;
    quantity: number;
    plaidAccountId?: string | undefined;
    institutionValue?: number | undefined;
    costBasis?: number | null | undefined;
    notes?: string | undefined;
}>;
export type Holding = z.infer<typeof HoldingSchema>;
export declare const SecuritySchema: z.ZodObject<{
    id: z.ZodString;
    assetType: z.ZodEnum<["stock", "crypto"]>;
    name: z.ZodNullable<z.ZodString>;
    tickerSymbol: z.ZodNullable<z.ZodString>;
    securityType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    closePrice: z.ZodNullable<z.ZodNumber>;
    logoUrl: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    updatedAt: Date;
    name: string | null;
    assetType: "stock" | "crypto";
    tickerSymbol: string | null;
    closePrice: number | null;
    securityType?: string | null | undefined;
    logoUrl?: string | undefined;
}, {
    id: string;
    updatedAt: Date;
    name: string | null;
    assetType: "stock" | "crypto";
    tickerSymbol: string | null;
    closePrice: number | null;
    securityType?: string | null | undefined;
    logoUrl?: string | undefined;
}>;
export type Security = z.infer<typeof SecuritySchema>;
export declare const InvitationSchema: z.ZodObject<{
    id: z.ZodString;
    familyId: z.ZodString;
    senderId: z.ZodString;
    senderName: z.ZodNullable<z.ZodString>;
    recipientEmail: z.ZodString;
    status: z.ZodEnum<["pending", "accepted", "declined"]>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    familyId: string;
    status: "pending" | "accepted" | "declined";
    createdAt: Date;
    senderId: string;
    senderName: string | null;
    recipientEmail: string;
}, {
    id: string;
    familyId: string;
    status: "pending" | "accepted" | "declined";
    createdAt: Date;
    senderId: string;
    senderName: string | null;
    recipientEmail: string;
}>;
export type Invitation = z.infer<typeof InvitationSchema>;
