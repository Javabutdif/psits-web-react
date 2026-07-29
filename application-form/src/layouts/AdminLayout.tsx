import { useState, type ReactNode } from 'react';
import { useAuth } from '../features/auth/auth.context';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/positions', label: 'Positions', icon: Briefcase },
  { to: '/admin/applicants', label: 'Applicants', icon: Users },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-4 text-sm font-medium text-gray-600 shadow-sm">
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

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <button
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden',
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          'bg-white fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-100 transition-all duration-300 lg:sticky',
          collapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className={cn('flex items-center border-b border-gray-100', collapsed ? 'justify-center p-3' : 'justify-between px-5 py-4')}>
          <Link
            to="/admin"
            className={cn('group flex items-center gap-3', collapsed && 'justify-center')}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
              <Briefcase className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black tracking-[0.18em] text-gray-900 uppercase">
                  Recruitment
                </span>
                <span className="text-[10px] font-medium text-gray-500">Admin console</span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:block"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                collapsed && 'justify-center px-2',
                isActive(item.to, item.exact)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {!collapsed && collapsed !== undefined && (
          <button
            onClick={() => setCollapsed(false)}
            className="hidden rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:block"
            style={{ display: 'none' }}
          />
        )}

        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={cn('flex-1', collapsed ? 'lg:ml-0' : '')}>
        <div className="page-shell py-6 sm:py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
