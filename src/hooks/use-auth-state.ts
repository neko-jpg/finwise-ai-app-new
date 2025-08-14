
import { useAuthState as useFirebaseAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { useEffect } from 'react';

export function useAuthState() {
    const auth = getAuth(firebaseApp);
    const [user, loading, error] = useFirebaseAuthState(auth);

    useEffect(() => {
        if (error) {
            console.error("Auth State Error:", error);
        }
    }, [error]);

    return { user, loading, error };
}
