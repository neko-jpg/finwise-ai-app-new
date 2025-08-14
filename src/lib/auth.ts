'use client';

import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, linkWithPopup, signOut as firebaseSignOut, type User, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from './firebase';

export const auth = getAuth(firebaseApp);

export function signInGuest(): Promise<any> {
    return signInAnonymously(auth);
}

export async function signInWithGoogle(){
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
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