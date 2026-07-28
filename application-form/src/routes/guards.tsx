// src/routes/guards.tsx

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/auth.context';

interface GuardProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: GuardProps) => {
  return children;
};

export const StudentRoute = ({ children }: GuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>; // In production, show spinner

  if (!user) {
    // Store the intended path for redirect after login
    window.localStorage.setItem('redirectPath', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }: GuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    window.localStorage.setItem('redirectPath', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};
