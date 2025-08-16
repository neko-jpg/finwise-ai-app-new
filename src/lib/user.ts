import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';

export interface Family {
  id: string;
  name: string;
  members: string[]; // array of user UIDs
  createdAt: any;
}

export interface AppUser {
  uid: string;
  familyId: string;
  email: string | null;
  displayName: string | null;
  primaryCurrency: string; // e.g., 'JPY'
  createdAt: any;
}

export interface Invitation {
  id: string;
  familyId: string;
  senderId: string;
  senderName: string | null;
  recipientEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

/**
 * Creates a user profile and a new family if the user is new.
 * Checks if the user document already exists to prevent overwriting.
 * @param user The Firebase Auth user object.
 */
export const createUserProfile = async (user: User): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  // Only proceed if the user document does not already exist
  if (!userDoc.exists()) {
    // 1. Create a new family for this user
    const familyRef = doc(db, 'families', user.uid); // Using user.uid as familyId for simplicity
    const newFamily: Family = {
      id: familyRef.id,
      name: `${user.displayName || 'My'} Family`,
      members: [user.uid],
      createdAt: serverTimestamp(),
    };
    await setDoc(familyRef, newFamily);

    // 2. Create the user's profile document
    const newUser: AppUser = {
      uid: user.uid,
      familyId: familyRef.id,
      email: user.email,
      displayName: user.displayName,
      primaryCurrency: 'JPY', // Default to JPY
      createdAt: serverTimestamp(),
      hasCompletedOnboarding: false, // Initialize onboarding flag
    };
    await setDoc(userRef, newUser);

    console.log(`New user profile and family created for ${user.uid}`);
  }
};
