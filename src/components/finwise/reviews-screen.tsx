'use client';
import { useState, useEffect, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { reviewFixedCosts, ReviewFixedCostsOutput } from '@/ai/flows/review-fixed-costs';
import type { Transaction } from '@/domain';
import { Timestamp } from 'firebase/firestore';

interface ReviewsScreenProps {
    transactions: Transaction[];
}

const convertTimestampsInObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date || obj instanceof Timestamp) return obj.toString();
    if (Array.isArray(obj)) return obj.map(convertTimestampsInObject);
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            newObj[key] = convertTimestampsInObject(value);
        }
    }
    return newObj;
};

export function ReviewsScreen({ transactions }: ReviewsScreenProps) {
    const [_isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [_review, setReview] = useState<ReviewFixedCostsOutput | null>(null);

    useEffect(() => {
        if (transactions.length > 0) {
            startTransition(async () => {
                try {
                    const result = await reviewFixedCosts({
                        transactions: convertTimestampsInObject(transactions)
                    });
                    setReview(result);
                } catch (e) {
                    console.error("Fixed cost review failed", e);
                    toast({
                        variant: "destructive",
                        title: "レビューの生成に失敗しました",
                        description: "AIによる分析中にエラーが発生しました。時間をおいて再度お試しください。",
                    });
                }
            });
        }
    }, [transactions, toast]);
    // ... rest of the component
    return <div/>;
}
