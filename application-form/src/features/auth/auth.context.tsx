// src/features/auth/auth.context.ts

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearRecruitmentToken,
  getRecruitmentAccessToken,
} from '../../api/client';

type AuthUser = {
  id: string;
  idNumber: string;
  role: 'admin' | 'student';
  campus: string;
  name?: string;
  email?: string;
  course?: string;
  year?: number | string;
  membershipStatus?: string;
  position?: string;
  access?: string;
};

interface UserContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
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
          const decoded = parseJwt(token);
          if (decoded) {
            setUserState({
              id: decoded.sub,
              idNumber: decoded.idNumber ?? '',
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

  const setUser = (nextUser: AuthUser | null) => {
    setUserState(nextUser);
  };

  const logout = () => {
    clearRecruitmentToken();
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
type JwtPayload = {
  sub: string;
  idNumber?: string;
  role: 'admin' | 'student';
  campus?: string;
};

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json) as JwtPayload;
  } catch (error) {
    return null;
  }
}
