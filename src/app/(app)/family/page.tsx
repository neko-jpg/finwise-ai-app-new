'use client';

import { FamilySettingsScreen } from '@/components/finwise/family-settings-screen';
import type { User } from 'firebase/auth';

interface FamilyPageProps {
  user?: User;
  familyId?: string;
}

export default function FamilyPage(props: FamilyPageProps) {
  return (
    <FamilySettingsScreen {...props} />
  );
}
