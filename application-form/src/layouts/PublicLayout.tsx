// src/layouts/PublicLayout.tsx

import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-md">
        <nav className="page-shell flex items-center justify-between py-4">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              RF
            </div>
            <div className="leading-tight">
              <div className="text-sm font-black tracking-[0.18em] text-gray-900 uppercase">
                Recruitment
              </div>
              <div className="text-xs font-medium text-gray-500">
                PSITS Application Form
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
              }
            >
              Open Positions
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-primary text-white shadow-sm hover:bg-primary-dark'}`
              }
            >
              Login
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="page-shell py-8 sm:py-10 lg:py-12">{children}</main>
    </div>
  );
};

export default PublicLayout;
