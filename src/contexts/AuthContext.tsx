/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  role: 'admin' | 'tenant' | null; // Add role to our context
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, role: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'tenant' | null>(null); // Add role state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If a user is logged in, get their ID token result
        const idTokenResult = await user.getIdTokenResult();
        // The custom claim 'role' we set in the cloud function is here!
        const userRole = idTokenResult.claims.role as 'admin' | 'tenant' | null;
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    role,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}