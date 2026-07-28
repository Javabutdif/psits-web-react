import type { ReactNode } from 'react';
import { useAuth } from '../features/auth/auth.context';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
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

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="border-b border-white/70 bg-white/90 backdrop-blur-md lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-100 px-6 py-6">
            <Link to="/admin" className="group flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                RF
              </div>
              <div className="leading-tight">
                <div className="text-sm font-black tracking-[0.18em] text-gray-900 uppercase">
                  Recruitment
                </div>
                <div className="text-xs font-medium text-gray-500">
                  Admin console
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
            <Link
              to="/admin"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/positions"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Positions
            </Link>
            <Link
              to="/admin/applicants"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Applicants
            </Link>
          </nav>

          <div className="border-t border-gray-100 px-4 py-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 lg:ml-72 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
};

export default AdminLayout;
