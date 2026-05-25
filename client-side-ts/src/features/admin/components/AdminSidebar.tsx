import React, { useState, useRef, useEffect } from "react";
import {
  Grid,
  Calendar,
  BarChart3,
  MoreVertical,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { useAuth } from "@/features/auth";
import { useCampusCheck } from "@/features/auth/hooks/useCampusCheck";
import { showToast } from "@/utils/alertHelper";
import { useNavigate, Link, useLocation } from "react-router-dom";

interface AdminSidebarProps {
  userName?: string;
  userRole?: string;
  userInitials?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userName = "Jan Lorenz Laroco",
  userRole = "Developer",
  userInitials = "JL",
  collapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isUcMainAdmin = useCampusCheck(["UC-Main"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getNavButtonClass = (path: string, isDisabled = false) =>
    cn(
      "w-full",
      collapsed ? "justify-center px-2" : "justify-start",
      isActivePath(path) &&
        "bg-[#1C9DDE]/10 text-[#1C9DDE] hover:bg-[#1C9DDE]/20 hover:text-[#1C9DDE]",
      isDisabled && "cursor-not-allowed text-gray-400 opacity-50"
    );

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
      showToast("success", "Logged out successfully");
      navigate("/auth/login", { replace: true });
    } catch {
      showToast("error", "Logout failed. Please try again.");
    }
  };
  return (
    <TooltipProvider>
      <aside
        className={cn(
          "bg-background fixed top-0 flex h-screen flex-col border transition-all duration-300 lg:sticky",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo and Collapse Button */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                <img
                  src={logo}
                  alt="PSITS Logo"
                  className="h-full w-full rounded-full object-contain"
                />
              </div>
              {!collapsed && (
                // hide long text on very small screens to avoid overflow
                <div className="hidden truncate sm:block">
                  <h1 className="m-0 text-xs leading-tight font-semibold">
                    Philippines Society of
                  </h1>
                  <h2 className="m-0 text-xs leading-tight font-semibold">
                    Information Technology
                  </h2>
                  <h3 className="m-0 text-xs leading-tight font-semibold">
                    Students
                  </h3>
                </div>
              )}
            </div>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleCollapse}
                className="hidden shrink-0 transition-all duration-300 lg:flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <PanelLeft
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    collapsed && "rotate-180"
                  )}
                />
              </Button>
            )}
          </div>
        </div>

        {/* <Separator /> */}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            {!collapsed && (
              <h3 className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                Navigation
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={getNavButtonClass(
                        "/admin/dashboard",
                        !isUcMainAdmin
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/dashboard" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <Grid className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Dashboard</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Dashboard</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <svg
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {!collapsed && <span>Organization</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Organization</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <svg
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        {!collapsed && <span>Students</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Students</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={getNavButtonClass("/admin/events")}
                      asChild
                    >
                      <Link to="/admin/events">
                        <Calendar className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="font-medium">Events</span>
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Events</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            {!collapsed && (
              <h3 className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                Operations
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <svg
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        {!collapsed && <span>Merchandise</span>}
                        {!collapsed && (
                          <svg
                            className="ml-auto h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Merchandise</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <svg
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {!collapsed && <span>Orders</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Orders</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <BarChart3 className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Reports</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Reports</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            </ul>
          </div>

          <div>
            {!collapsed && (
              <h3 className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
                General
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <svg
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {!collapsed && <span>Settings</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Settings</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <svg
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        {!collapsed && <span>Documentation</span>}
                        {!collapsed && (
                          <svg
                            className="ml-auto h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Documentation</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
              <li>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full",
                        collapsed ? "justify-center px-2" : "justify-start",
                        !isUcMainAdmin &&
                          "cursor-not-allowed text-gray-400 opacity-50"
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/under-construction" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <svg
                          className="h-5 w-5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {!collapsed && <span>Logs</span>}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>Logs</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            </ul>
          </div>
        </nav>

        <Separator />

        {/* User Profile */}
        <div className="p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarFallback className="bg-orange-400 font-semibold text-white">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("") || userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div>
                  <p className="font-medium">{user?.name || userName}</p>
                  <p className="text-muted-foreground text-xs">
                    {user?.role || userRole}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-orange-400 font-semibold text-white">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("") || userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user?.name || userName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {user?.role || userRole}
                </p>
              </div>
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setMenuOpen((s) => !s)}
                  aria-label="More options"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 bottom-full z-50 mb-2 w-40 rounded-md border border-gray-200 bg-white text-black">
                    <button
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AdminSidebar;
