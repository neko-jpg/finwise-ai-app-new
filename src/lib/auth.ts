
'use client';

import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, linkWithPopup, signOut as firebaseSignOut, type User, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from './firebase';

export const auth = getAuth(firebaseApp);

export function signInGuest(): Promise<any> {
    return signInAnonymously(auth);
}

export async function signInWithGoogle(){
    const provider = new GoogleAuthProvider();
    try {
        return await signInWithPopup(auth, provider);
    } catch (e: any) {
        if (e.code === 'auth/popup-closed-by-user') {
            // User closed the popup, this is not a critical error.
            // We can resolve the promise without a user object.
            return Promise.resolve(null);
        }
        // Re-throw other errors to be handled by the caller.
        throw e;
    }
}

export async function signUpWithEmail(email: string, password: string): Promise<any> {
    return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password);
}

export function linkToGoogle(): Promise<any> {
    if (!auth.currentUser) {
        return Promise.reject(new Error('No user signed in'));
    }
    const provider = new GoogleAuthProvider();
    return linkWithPopup(auth.currentUser, provider);
}

export function signOut(): Promise<any> {
    return firebaseSignOut(auth);
}
