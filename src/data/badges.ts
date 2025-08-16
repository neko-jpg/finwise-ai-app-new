import { Badge } from '@/lib/types';
import { Award, CalendarCheck } from 'lucide-react';

export const BADGES: Record<string, Badge> = {
    'one_month_user': {
        id: 'one_month_user',
        name: '継続の達人（1ヶ月）',
        description: 'Finwise AIを1ヶ月以上継続して利用しています。',
        icon: CalendarCheck,
    },
    'first_budget_met': {
        id: 'first_budget_met',
        name: 'はじめての予算達成',
        description: '初めて月の予算を達成しました！',
        icon: Award,
    },
    // Add more badges here in the future
};
