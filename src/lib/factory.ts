import { TransactionSchema, type Transaction, GoalSchema, type Goal } from "@/domain";
import { faker } from '@faker-js/faker';

/**
 * Creates a valid Transaction object with sensible defaults.
 * @param partial A partial Transaction object to override the defaults.
 * @returns A full, validated Transaction object.
 */
export function makeTransaction(partial: Partial<Transaction> = {}): Transaction {
  const now = new Date();
  const merchant = partial.merchant || faker.company.name();
  const amount = partial.amount ?? parseFloat(faker.finance.amount({ min: -50000, max: -100, dec: 2 }));

  const base: Transaction = {
    id: partial.id ?? faker.string.uuid(),
    familyId: partial.familyId ?? 'dev-family',
    amount: amount,
    originalAmount: partial.originalAmount ?? amount,
    originalCurrency: partial.originalCurrency ?? 'JPY',
    merchant: merchant,
    bookedAt: partial.bookedAt ?? faker.date.recent({ days: 30 }),
    category: partial.category ?? { major: 'misc' },
    source: partial.source ?? 'manual',
    hash: partial.hash ?? faker.string.uuid(),
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    // Optional fields
    note: partial.note,
    attachment: partial.attachment,
    recurring: partial.recurring,
    clientUpdatedAt: partial.clientUpdatedAt,
    deletedAt: partial.deletedAt,
    scope: partial.scope ?? 'personal',
    createdBy: partial.createdBy ?? 'dev-user',
    taxTag: partial.taxTag,
    tags: partial.tags,
    plaidTransactionId: partial.plaidTransactionId,
    plaidAccountId: partial.plaidAccountId,
  };

  // In development, we validate to ensure our factories are correct.
  // In production, we can skip this for performance.
  if (process.env.NODE_ENV !== "production") {
    return TransactionSchema.parse(base);
  }
  return base;
}

/**
 * Creates a valid Goal object with sensible defaults.
 * @param partial A partial Goal object to override the defaults.
 * @returns A full, validated Goal object.
 */
export function makeGoal(partial: Partial<Goal> = {}): Goal {
    const now = new Date();
    const base: Goal = {
        id: partial.id ?? faker.string.uuid(),
        familyId: partial.familyId ?? 'dev-family',
        name: partial.name ?? faker.commerce.productName(),
        target: partial.target ?? parseFloat(faker.finance.amount({ min: 50000, max: 1000000, dec: 0 })),
        saved: partial.saved ?? parseFloat(faker.finance.amount({ min: 0, max: 40000, dec: 0 })),
        due: partial.due ?? faker.date.future(),
        createdAt: partial.createdAt ?? now,
        updatedAt: partial.updatedAt ?? now,
        createdBy: partial.createdBy ?? 'dev-user',
        scope: partial.scope ?? 'personal',
    };

    if (process.env.NODE_ENV !== "production") {
        return GoalSchema.parse(base);
    }
    return base;
}
