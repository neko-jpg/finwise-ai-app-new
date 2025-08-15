import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { createHash } from 'crypto';
import type { Transaction } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a consistent hash for a transaction object to detect duplicates.
 * The hash is based on the user ID, date, amount, and merchant name.
 */
export function createTransactionHash(tx: Partial<Transaction>, userId: string): string {
  const date = tx.bookedAt ? new Date(tx.bookedAt) : new Date();
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

  const data = [
    userId,
    dateString,
    (tx.originalAmount || tx.amount)?.toFixed(2),
    tx.originalCurrency,
    tx.merchant?.trim().toLowerCase(),
  ].join('-');

  return createHash('sha256').update(data).digest('hex');
}
