
'use client';

import { GoalsScreen } from '@/components/finwise/goals-screen';
import type { Goal } from '@/domain';
import type { User } from 'firebase/auth';

interface GoalsPageProps {
  user?: User;
  familyId?: string;
  goals: Goal[];
  loading?: boolean;
}

export default function GoalsPage(props: GoalsPageProps) {
  return (
    <GoalsScreen {...props} />
  );
}
