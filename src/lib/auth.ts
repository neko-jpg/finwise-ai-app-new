import { getAuth, signInAnonymously, GoogleAuthProvider, linkWithPopup, signOut as firebaseSignOut, type User, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { firebaseApp, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { userConverter, familyConverter } from '@/repo';
import type { AppUser, Family } from '@/domain';

export const auth = getAuth(firebaseApp);

export const createUserProfile = async (user: User): Promise<void> => {
  const userRef = doc(db, 'users', user.uid).withConverter(userConverter);
  if ((await getDoc(userRef)).exists()) return;

  const familyRef = doc(db, 'families', user.uid).withConverter(familyConverter);
  const newFamily: Family = {
    id: familyRef.id,
    name: `${user.displayName || 'My'} Family`,
    members: [user.uid],
    admins: [user.uid],
    createdAt: new Date(),
  };
  await setDoc(familyRef, newFamily);

  const newUser: AppUser = {
    uid: user.uid,
    familyId: familyRef.id,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    primaryCurrency: 'JPY',
    createdAt: new Date(),
    updatedAt: new Date(),
    hasCompletedOnboarding: false,
  };
  await setDoc(userRef, newUser);
};

export function signInGuest(): Promise<UserCredential> { return signInAnonymously(auth); }
export function signInWithGoogle(): Promise<UserCredential> { return signInWithPopup(auth, new GoogleAuthProvider()); }
export function signUpWithEmail(email:string, pass:string): Promise<UserCredential> { return createUserWithEmailAndPassword(auth, email, pass); }
export function signInWithEmail(email:string, pass:string): Promise<UserCredential> { return signInWithEmailAndPassword(auth, email, pass); }
export function signOut(): Promise<void> { return firebaseSignOut(auth); }
export function linkToGoogle(): Promise<UserCredential> {
    if (!auth.currentUser) throw new Error('No user');
    return linkWithPopup(auth.currentUser, new GoogleAuthProvider());
}
