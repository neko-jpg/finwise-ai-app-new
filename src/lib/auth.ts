import { getAuth, signInAnonymously, GoogleAuthProvider, linkWithPopup, signOut as firebaseSignOut, type User, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential, getAdditionalUserInfo, getIdToken, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { app as firebaseApp, db } from './firebase/client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { userConverter, familyConverter } from '@/lib/repo';
import type { AppUser, Family } from '@/lib/domain';
import { FirebaseError } from 'firebase/app';

export const auth = getAuth(firebaseApp);

const getFirebaseAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'メールアドレスまたはパスワードが正しくありません。';
        case 'auth/email-already-in-use':
            return 'このメールアドレスは既に使用されています。';
        case 'auth/weak-password':
            return 'パスワードは6文字以上で入力してください。';
        case 'auth/invalid-email':
            return '無効なメールアドレスです。';
        case 'auth/user-disabled':
            return 'このアカウントは無効化されています。';
        case 'auth/too-many-requests':
            return 'リクエストが多すぎます。後でもう一度お試しください。';
        default:
            return '認証中に不明なエラーが発生しました。';
    }
}

export const handleAuth = async (authPromise: Promise<UserCredential>): Promise<{ success: boolean; message: string }> => {
    try {
        const userCred = await authPromise;
        if (getAdditionalUserInfo(userCred)?.isNewUser) {
            await createUserProfile(userCred.user);
        }

        const idToken = await getIdToken(userCred.user);
        const base = process.env.NEXT_PUBLIC_API_BASE ?? '/api';
        const response = await fetch(`${base}/sessionLogin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
            credentials: 'include', // クロスオリジンでCookieを送信するために必須
        });

        if (!response.ok) {
            const resJson = await response.json().catch(() => ({}));
            const errorMessage = resJson.error || `セッションの作成に失敗しました (${response.status})。`;
            throw new Error(errorMessage);
        }

        return { success: true, message: 'ログインしました' };

    } catch (e: unknown) {
        let message: string;
        if (e instanceof FirebaseError) {
            message = getFirebaseAuthErrorMessage(e.code);
        } else if (e instanceof Error) {
            message = e.message;
        } else {
            message = '不明なエラーが発生しました。';
        }
        return { success: false, message };
    }
};


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
export async function signOut(): Promise<void> {
    try {
        const base = process.env.NEXT_PUBLIC_API_BASE ?? '/api';
        await fetch(`${base}/sessionLogout`, { method: 'POST' });
    } catch (error) {
        console.error('セッションのクリアに失敗しました:', error);
    } finally {
        await firebaseSignOut(auth);
        window.location.assign('/entry');
    }
}

export function linkToGoogle(): Promise<UserCredential> {
    if (!auth.currentUser) throw new Error('No user');
    return linkWithPopup(auth.currentUser, new GoogleAuthProvider());
}
