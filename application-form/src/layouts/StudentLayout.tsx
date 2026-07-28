// src/layouts/StudentLayout.tsx

import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/auth.context';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="surface px-6 py-4 text-sm font-medium text-gray-600">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    window.localStorage.setItem('redirectPath', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-md">
        <nav className="page-shell flex items-center justify-between py-4">
          <Link to="/applications" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              RF
            </div>
            <div className="leading-tight">
              <div className="text-sm font-black tracking-[0.18em] text-gray-900 uppercase">
                Recruitment
              </div>
              <div className="text-xs font-medium text-gray-500">
                Student portal
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/applications"
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              My Applications
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="page-shell py-8 sm:py-10 lg:py-12">{children}</main>
    </div>
  );
};

export default StudentLayout;
