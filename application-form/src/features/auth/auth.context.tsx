// src/features/auth/auth.context.ts

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAccessToken, clearToken } from '../../api/client';

interface UserContextType {
  user: { id: string; role: string; campus: string } | null;
  loading: boolean;
  setUser: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<UserContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from token on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          // Decode token to get user info (or fetch from /me endpoint)
          const decoded = parseJwt(token);
          if (decoded) {
            setUserState({
              id: decoded.sub,
              role: decoded.role,
              campus: decoded.campus || '',
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const setUser = (user: any) => {
    setUserState(user);
  };

  const logout = () => {
    clearToken();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to decode JWT (simple client-side decoding without crypto)
function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}
