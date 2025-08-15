import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, DocumentData, FirestoreError, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { InvestmentAccount, Holding, Security } from '@/lib/types';

// Define a new type for the combined data structure
export interface EnrichedHolding extends Holding {
  security: Security | null;
}

export interface EnrichedInvestmentAccount extends InvestmentAccount {
  holdings: EnrichedHolding[];
}

interface UseInvestmentDataReturn {
    accounts: EnrichedInvestmentAccount[];
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useInvestmentData(familyId: string | undefined): UseInvestmentDataReturn {
    const [accounts, setAccounts] = useState<EnrichedInvestmentAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!familyId) {
            setLoading(false);
            setAccounts([]);
            return;
        }

        setLoading(true);

        const accountsQuery = query(collection(db, 'investment_accounts'), where('familyId', '==', familyId));
        const holdingsQuery = query(collection(db, 'holdings'), where('familyId', '==', familyId));

        const unsubscribeAccounts = onSnapshot(accountsQuery, async (accountsSnapshot) => {
            const accountsData = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestmentAccount));

            const unsubscribeHoldings = onSnapshot(holdingsQuery, async (holdingsSnapshot) => {
                const holdingsData = holdingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Holding));

                // Get all unique security IDs from the holdings
                const securityIds = [...new Set(holdingsData.map(h => h.securityId))];
                const securities: { [id: string]: Security } = {};

                // Fetch all required securities in parallel
                if (securityIds.length > 0) {
                    const securityRefs = securityIds.map(id => doc(db, 'securities', id));
                    // Note: Using getDocs for a one-time fetch inside onSnapshot.
                    // A more advanced implementation might also listen to security price changes.
                    const securitySnapshots = await Promise.all(securityRefs.map(ref => getDocs(query(collection(db, 'securities'), where('__name__', '==', ref.id)))));

                    const securityDocs = await getDocs(query(collection(db, 'securities'), where('__name__', 'in', securityIds)));
                    securityDocs.forEach(doc => {
                        securities[doc.id] = { id: doc.id, ...doc.data() } as Security;
                    });
                }

                // Combine the data
                const enrichedAccounts = accountsData.map(account => {
                    const accountHoldings = holdingsData.filter(h => h.plaidAccountId === account.id);
                    const enrichedHoldings = accountHoldings.map(holding => ({
                        ...holding,
                        security: securities[holding.securityId] || null,
                    }));
                    return { ...account, holdings: enrichedHoldings };
                });

                setAccounts(enrichedAccounts);
                setLoading(false);
            }, (err) => {
                console.error("useInvestmentData (holdings) error:", err);
                setError(err);
                setLoading(false);
            });

            return () => unsubscribeHoldings();
        }, (err) => {
            console.error("useInvestmentData (accounts) error:", err);
            setError(err);
            setLoading(false);
        });

        return () => {
            unsubscribeAccounts();
        };
    }, [familyId]);

    return { accounts, loading, error };
}
