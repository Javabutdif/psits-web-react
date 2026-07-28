import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/auth.context';
import { Navigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    window.localStorage.setItem('redirectPath', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-sm border-r fixed h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Recruitment Admin</h2>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin" className="block text-gray-600 hover:text-gray-900 py-2">Dashboard</a>
          <a href="/admin/positions" className="block text-gray-600 hover:text-gray-900 py-2">Positions</a>
          <a href="/admin/applicants" className="block text-gray-600 hover:text-gray-900 py-2">Applicants</a>
        </nav>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
