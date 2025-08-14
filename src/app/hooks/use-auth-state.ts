import { useAuthState as useFirebaseAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

export function useAuthState() {
    const auth = getAuth(firebaseApp);
    const [user, loading, error] = useFirebaseAuthState(auth);

    return { user, loading, error };
}
