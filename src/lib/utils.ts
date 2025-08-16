import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Transaction } from '@/domain';
import { SHA256 } from 'crypto-js';
import { format } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a SHA256 hash from transaction details to identify potential duplicates.
 * @param tx An object with the core fields for hashing.
 * @returns A SHA256 hash string.
 */
export function createTransactionHash(tx: { bookedAt: Date, merchant: string, amount: number, originalCurrency: string }): string {
  // Use a consistent date format to ensure the hash is the same regardless of timezones.
  const dateString = format(tx.bookedAt, 'yyyy-MM-dd');
  
  // Create a consistent string from the core details of the transaction.
  // This helps identify duplicates even if they are entered seconds apart.
  const sourceString = `${dateString}-${tx.merchant}-${tx.amount}-${tx.originalCurrency}`;
  
  return SHA256(sourceString).toString();
}
