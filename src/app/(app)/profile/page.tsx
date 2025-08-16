
'use client';

import { ProfileScreen } from '@/components/finwise/profile-screen';
import type { User } from 'firebase/auth';

interface ProfilePageProps {
  user?: User;
  loading?: boolean;
}

export default function ProfilePage(props: ProfilePageProps) {
  return (
    <ProfileScreen {...props} />
  );
}
