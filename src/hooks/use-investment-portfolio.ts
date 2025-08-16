import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, doc, getDocs, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Holding, Security, Account as PlaidAccount } from '@/domain';

export interface EnrichedHolding extends Holding {
  security: Security | null;
}

export interface EnrichedPlaidAccount extends PlaidAccount {
  holdings: EnrichedHolding[];
}

interface UseInvestmentPortfolioReturn {
    plaidAccounts: EnrichedPlaidAccount[];
    cryptoHoldings: EnrichedHolding[];
    loading: boolean;
    error: FirestoreError | undefined;
}

export function useInvestmentPortfolio(familyId: string | undefined, userId: string | undefined): UseInvestmentPortfolioReturn {
    const [plaidAccounts, setPlaidAccounts] = useState<EnrichedPlaidAccount[]>([]);
    const [cryptoHoldings, setCryptoHoldings] = useState<EnrichedHolding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | undefined>(undefined);

    useEffect(() => {
        if (!familyId || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const holdingsQuery = query(collection(db, 'holdings'), where('familyId', '==', familyId));

        const unsubscribe = onSnapshot(holdingsQuery, async (holdingsSnapshot) => {
            try {
                const holdingsData = holdingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Holding));

                const securityIds = [...new Set(holdingsData.map(h => h.securityId))].filter(Boolean);
                const securities: { [id: string]: Security } = {};

                if (securityIds.length > 0) {
                    const securityDocs = await getDocs(query(collection(db, 'securities'), where('__name__', 'in', securityIds)));
                    securityDocs.forEach(doc => {
                        securities[doc.id] = { id: doc.id, ...doc.data() } as Security;
                    });
                }

                const allEnrichedHoldings: EnrichedHolding[] = holdingsData.map(holding => ({
                    ...holding,
                    security: securities[holding.securityId] || null,
                }));

                const crypto = allEnrichedHoldings.filter(h => h.security?.assetType === 'crypto');
                const stocks = allEnrichedHoldings.filter(h => h.security?.assetType === 'stock');

                setCryptoHoldings(crypto);

                // Handle Plaid accounts separately
                const plaidAccountsQuery = query(collection(db, 'accounts'), where('familyId', '==', familyId));
                const plaidAccountsSnapshot = await getDocs(plaidAccountsQuery);
                const plaidAccountsData = plaidAccountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaidAccount));

                const enrichedPlaidAccounts = plaidAccountsData.map(account => ({
                    ...account,
                    holdings: stocks.filter(h => h.plaidAccountId === account.id),
                }));

                setPlaidAccounts(enrichedPlaidAccounts);

            } catch (err) {
                console.error("useInvestmentPortfolio error:", err);
                setError(err as FirestoreError);
            } finally {
                setLoading(false);
            }
        }, (err) => {
            console.error("useInvestmentPortfolio snapshot error:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [familyId, userId]);

    return { plaidAccounts, cryptoHoldings, loading, error };
}
