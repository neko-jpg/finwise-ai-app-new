import { useMemo } from 'react';
import type { Account } from '@/domain';
import type { Transaction } from '@/domain';

// For 2024. In a real app, this would come from a configuration or be year-dependent.
const IRA_CONTRIBUTION_LIMIT = 7000;

const RETIREMENT_ACCOUNT_SUBTYPES = [
    'ira',
    'roth',
    '401k',
    '403b',
    'sep ira',
    'simple ira',
    'thrift savings plan',
];

interface UseContributionTrackerReturn {
    totalContribution: number;
    contributionLimit: number;
    contributingTransactions: Transaction[];
    retirementAccounts: Account[];
}

export function useContributionTracker(
    accounts: Account[],
    transactions: Transaction[],
    year: number
): UseContributionTrackerReturn {
    const { totalContribution, contributingTransactions, retirementAccounts } = useMemo(() => {
        const currentYearStart = new Date(year, 0, 1);
        const currentYearEnd = new Date(year, 11, 31);

        const retAccounts = accounts.filter(acc =>
            acc.type === 'investment' && RETIREMENT_ACCOUNT_SUBTYPES.includes(acc.subtype.toLowerCase())
        );
        const retAccountIds = retAccounts.map(acc => acc.id);

        if (retAccountIds.length === 0) {
            return { totalContribution: 0, contributingTransactions: [], retirementAccounts: [] };
        }

        const contribTrans = transactions.filter(t => {
            const transactionDate = new Date(t.bookedAt);
            // Contribution is a positive amount (deposit) into a retirement account
            return t.plaidAccountId &&
                   retAccountIds.includes(t.plaidAccountId) &&
                   t.amount > 0 &&
                   transactionDate >= currentYearStart &&
                   transactionDate <= currentYearEnd;
        });

        const total = contribTrans.reduce((sum, t) => sum + t.amount, 0);

        return {
            totalContribution: total,
            contributingTransactions: contribTrans,
            retirementAccounts: retAccounts
        };
    }, [accounts, transactions, year]);

    return {
        totalContribution,
        contributionLimit: IRA_CONTRIBUTION_LIMIT,
        contributingTransactions,
        retirementAccounts,
    };
}
