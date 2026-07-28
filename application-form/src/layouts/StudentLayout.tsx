// src/layouts/StudentLayout.tsx

import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/auth.context';
import { Navigate, useLocation } from 'react-router-dom';

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    window.localStorage.setItem('redirectPath', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Recruitment</h1>
          <div>
            <a href="/applications" className="text-gray-600 hover:text-gray-900 mr-4">My Applications</a>
            <button onClick={() => logout()} className="text-red-600 hover:text-red-900">Logout</button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

function logout() {
  window.localStorage.removeItem('redirectPath');
  window.location.href = '/';
}

export default StudentLayout;
