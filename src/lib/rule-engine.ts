import type { Transaction, Rule } from '@/lib/domain';

/**
 * Applies a set of rules to a single transaction.
 * The first rule that matches will be applied. Rules should be sorted by priority beforehand.
 * @param transaction The transaction to process.
 * @param rules An array of rules to apply.
 * @returns The transaction, potentially modified by a rule.
 */
export function applyRulesToTransaction(transaction: Transaction, rules: Rule[]): Transaction {
  const applicableRule = rules.find(rule => {
    const { field, operator, value } = rule.trigger;

    if (field === 'merchant') {
      const merchant = transaction.merchant.toLowerCase();
      const triggerValue = String(value).toLowerCase();
      if (operator === 'contains' && merchant.includes(triggerValue)) {
        return true;
      }
      if (operator === 'equals' && merchant === triggerValue) {
        return true;
      }
    }

    if (field === 'amount') {
      const amount = transaction.amount;
      const triggerValue = Number(value);
      if (isNaN(triggerValue)) return false;

      if (operator === 'equals' && amount === triggerValue) {
        return true;
      }
      if (operator === 'greater_than' && amount > triggerValue) {
        return true;
      }
      if (operator === 'less_than' && amount < triggerValue) {
        return true;
      }
    }

    return false;
  });

  if (applicableRule) {
    const { field, value } = applicableRule.action;
    if (field === 'category') {
      // Return a new transaction object with the category updated
      return {
        ...transaction,
        category: {
          ...transaction.category,
          major: String(value),
        },
      };
    }
  }

  // If no rules match, return the original transaction
  return transaction;
}
