'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChanged は非同期でユーザーの状態を通知する
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      // サーバーサイドのセッションも破棄する
      await fetch('/api/sessionLogout', { method: 'POST' });
      router.push('/entry');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const value = {
    user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <GlobalLoader /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// アプリケーション全体のローディング画面
const GlobalLoader = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
};
