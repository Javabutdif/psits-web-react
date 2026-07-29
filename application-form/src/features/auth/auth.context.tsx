// src/features/auth/auth.context.tsx

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  clearRecruitmentToken,
  setRecruitmentAccessToken,
  refreshAccessToken,
} from '../../api/client';
import api from '../../api/client';

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

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

interface UserContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  login: (idNumber: string, password: string) => Promise<AuthUser | null>;
}

const AuthContext = createContext<UserContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  // Silent session restoration on mount
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const restoredSession = await refreshAccessToken();

        if (restoredSession && !cancelled) {
          setUserState(restoredSession.user);
          return;
        }

        clearRecruitmentToken();
        setUserState(null);
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearRecruitmentToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/v2/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    }
    clearRecruitmentToken();
    setUserState(null);
    window.localStorage.removeItem('redirectPath');
  }, []);

  const login = useCallback(async (idNumber: string, password: string) => {
    const response = await api.post<LoginResponse>('/v2/auth/login', {
      id_number: idNumber,
      password: password,
    });

    const { accessToken, user: userData } = response.data;
    setRecruitmentAccessToken(accessToken);

    const user: AuthUser = {
      id: userData.id || '',
      idNumber,
      role: userData.role || 'student',
      campus: userData.campus || 'UC-Main',
    };
    setUser(user);

    window.localStorage.removeItem('redirectPath');
    return user;
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Signing in...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, login }}>
      {children}
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
