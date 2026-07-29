import { useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../features/auth/auth.context';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Briefcase, LogOut, FileText } from 'lucide-react';

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = lastScrollY.current;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    lastScrollY.current = latest;
  });

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

  if (user?.role !== 'student') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-2 right-0 left-0 z-50 flex justify-center px-3 md:top-4 md:px-0">
        <motion.nav
          variants={{
            visible: { y: 0, opacity: 1 },
            hidden: { y: -100, opacity: 0 },
          }}
          animate={hidden ? 'hidden' : 'visible'}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex h-14 w-full max-w-7xl items-center justify-between rounded-full border border-gray-100/50 bg-white/95 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md md:h-16 md:px-6"
        >
          <Link to="/applications" className="group flex shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/20 transition-transform group-hover:scale-105 md:h-10 md:w-10">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-black tracking-[0.18em] text-gray-900 uppercase md:text-sm">
                Recruitment
              </span>
              <span className="text-[10px] font-medium text-gray-500 md:text-xs">
                Student portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/applications"
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 md:px-4',
                location.pathname === '/applications'
                  ? 'bg-primary/5 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="hidden sm:inline">My Applications</span>
              <span className="sm:hidden">
                <FileText className="h-4 w-4" />
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-95 md:px-5 md:py-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </motion.nav>
      </div>
      <main className="page-shell pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pb-12">{children}</main>
    </div>
  );
};

export default StudentLayout;
