import logo from "@/assets/logo.png";
import { CampusView } from "@/components/common/CampusView";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth";
import type { Campus } from "@/features/auth/types/auth.types";
import { cn } from "@/lib/utils";
import showToast from "@/utils/alertHelper";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import {
  ChevronDown,
  LogOut,
  Menu,
  ShoppingCart,
  UserCircle,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";

interface NavLinkItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  allowedCampus?: Campus[];
}

const staticNavLinks: NavLinkItem[] = [
  { name: "Events", href: "/events" },
  { name: "Organizations", href: "/organizations" },
  { name: "Resources", href: "/resources" },
  {
    name: "Shop",
    href: "/shop",
    hasDropdown: false,
    allowedCampus: ["UC-MAIN", "UC-CS"],
  },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const location = useLocation();
  const isStaticPage = ["/privacy", "/terms"].includes(location.pathname);

  const homeHref =
    !isAuthenticated || !user
      ? "/"
      : user.role === "admin"
        ? "/admin/events"
        : user.role === "student"
          ? "/student/event-attendance"
          : "/";

  const navLinks: NavLinkItem[] = [
    { name: "Home", href: homeHref },
    ...staticNavLinks,
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isStaticPage) {
      setHidden(false);
      return;
    }
    const previous = lastScrollY.current;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    lastScrollY.current = latest;
  });

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
      showToast("success", "Logged out successfully");
      navigate("/auth/login", { replace: true });
    } catch {
      showToast("error", "Logout failed. Please try again.");
    }
  };
  const renderNavLink = (link: NavLinkItem, mobile = false) => {
    const linkEl = mobile ? (
      <NavLink
        key={link.name}
        to={link.href}
        onClick={() => setIsOpen(false)}
        className={({ isActive }) =>
          cn(
            "flex items-center justify-between rounded-2xl p-4 transition-all duration-200",
            isActive
              ? "bg-primary/10 text-primary font-bold"
              : "text-gray-600 hover:bg-gray-50"
          )
        }
      >
        <span className="text-lg">{link.name}</span>
        {link.hasDropdown && (
          <ChevronDown
            size={18}
            className="opacity-50 transition-transform duration-200"
          />
        )}
      </NavLink>
    ) : (
      <div key={link.name} className="group relative">
        <NavLink
          to={link.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200",
              isActive
                ? "text-primary bg-primary/5"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )
          }
        >
          {link.name}
          {link.hasDropdown && <ChevronDown size={14} className="opacity-50" />}
        </NavLink>
      </div>
    );

    if (link.allowedCampus) {
      // Not logged in — show the link freely (no campus restriction applies)
      if (!isAuthenticated || !user) return linkEl;

      // Logged in — restrict by campus
      return (
        <CampusView
          key={link.name}
          allowedCampuses={link.allowedCampus}
          role={user.role === "admin" ? "admin" : "student"}
        >
          {linkEl}
        </CampusView>
      );
    }

    return linkEl;
  };

  return (
    <div
      className={cn(
        "top-2 right-0 left-0 z-50 flex justify-center px-3 md:top-4 md:px-0",
        isStaticPage ? "absolute" : "fixed"
      )}
    >
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="flex h-14 w-full max-w-7xl items-center justify-between rounded-full border border-gray-100/50 bg-white/95 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md md:h-16 md:px-6"
      >
        {/* Logo */}
        <Link to={homeHref} className="group flex shrink-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center md:h-10 md:w-10">
            <motion.img
              src={logo}
              alt="PSITS Logo"
              className="h-full w-full object-contain"
              whileHover={{ rotate: 10, scale: 1.05 }}
            />
          </div>
          <div className="hidden flex-col leading-tight lg:flex">
            <span className="text-[10px] font-extrabold tracking-tight text-gray-900 md:text-sm">
              PHILIPPINE SOCIETY OF INFORMATION
            </span>
            <span className="text-[10px] font-extrabold tracking-tight text-gray-900 md:text-sm">
              TECHNOLOGY STUDENTS
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900 lg:hidden">
            PSITS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 lg:flex xl:gap-4">
          {navLinks.map((link) => renderNavLink(link, false))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Cart — only for authenticated UC-MAIN users */}
          {isAuthenticated && user ? (
            <CampusView
              allowedCampuses={["UC-MAIN", "UC-CS"]}
              role={user.role === "admin" ? "admin" : "student"}
            >
              <Link
                to="/cart"
                className="flex items-center gap-2 rounded-full px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                aria-label="View cart"
              >
                <ShoppingCart size={20} />
                <span className="hidden text-sm font-semibold xl:inline">
                  Cart
                </span>
              </Link>
            </CampusView>
          ) : (
            <Link
              to="/cart"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              aria-label="View cart"
            >
              <ShoppingCart size={20} />
              <span className="hidden text-sm font-semibold xl:inline">
                Cart
              </span>
            </Link>
          )}

          {/* User Profile or Sign In */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full px-3 py-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
                  <UserCircle size={20} />
                  <span className="hidden text-sm font-semibold xl:inline">
                    {user.name || user.idNumber}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <UserCircle size={16} />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="h-9 rounded-full bg-[#1c9dde] px-4 font-semibold text-white shadow-md transition-all hover:bg-[#1c9dde]/90 active:scale-95 md:px-5"
            >
              <Link to="/auth/login">Sign in</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-full right-0 left-0 z-[60] mx-4 mt-4 max-h-[80vh] overflow-hidden overflow-y-auto rounded-3xl border border-gray-100 bg-white/95 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-2 p-4">
                {navLinks.map((link) => renderNavLink(link, true))}

                <div className="mx-2 my-2 h-px bg-gray-100" />

                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-primary/5 rounded-2xl px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name || user.idNumber}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full rounded-2xl py-6 text-base font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full rounded-2xl py-6 text-base font-semibold"
                    >
                      <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full rounded-2xl bg-[#1c9dde] py-6 text-base font-bold shadow-xl"
                    >
                      <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                        Join Us
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};
