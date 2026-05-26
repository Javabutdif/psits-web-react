import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  Grid,
  Calendar,
  BarChart3,
  FileText,
  GraduationCap,
  MoreVertical,
  PanelLeft,
  LogOut,
  Settings,
  ShoppingBag,
  Users,
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
      collapsed ? "h-10 justify-center px-0" : "justify-start",
      isActivePath(path) &&
        "bg-[#1C9DDE]/10 text-[#1C9DDE] hover:bg-[#1C9DDE]/20 hover:text-[#1C9DDE]",
      isDisabled && "cursor-not-allowed text-gray-400 opacity-50"
    );

  const restrictedNavButtonClass = cn(
    "w-full",
    collapsed ? "h-10 justify-center px-0" : "justify-start",
    !isUcMainAdmin && "cursor-not-allowed text-gray-400 opacity-50"
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
    <TooltipProvider delayDuration={700}>
      <aside
        className={cn(
          "group/sidebar bg-background fixed top-0 flex h-screen flex-col border transition-all duration-300 lg:sticky",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo and Collapse Button */}
        <div
          className={cn(
            "relative p-4",
            collapsed && "flex h-20 items-center justify-center px-2 py-4"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <div
              className={cn(
                "flex min-w-0 items-center gap-3",
                collapsed && "justify-center"
              )}
            >
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
                className={cn(
                  "hidden shrink-0 transition-all duration-300 lg:flex",
                  collapsed &&
                    "absolute top-4 right-1 h-7 w-7 border bg-background opacity-0 shadow-sm group-hover/sidebar:opacity-100 focus-visible:opacity-100"
                )}
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
                <Tooltip open={false}>
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={getNavButtonClass(
                        "/admin/organization",
                        !isUcMainAdmin
                      )}
                      asChild
                    >
                      <Link
                        to={isUcMainAdmin ? "/admin/organization" : "#"}
                        onClick={(e) => {
                          if (!isUcMainAdmin) {
                            e.preventDefault();
                            showToast("error", "Unauthorized.");
                          }
                        }}
                      >
                        <Users className="h-5 w-5 shrink-0" />
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={restrictedNavButtonClass}
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
                        <GraduationCap className="h-5 w-5 shrink-0" />
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
                <Tooltip open={false}>
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={restrictedNavButtonClass}
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
                        <ShoppingBag className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Merchandise</span>}
                        {!collapsed && (
                          <ChevronDown className="ml-auto h-4 w-4" />
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={restrictedNavButtonClass}
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
                        <ClipboardList className="h-5 w-5 shrink-0" />
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={restrictedNavButtonClass}
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={restrictedNavButtonClass}
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
                        <Settings className="h-5 w-5 shrink-0" />
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={restrictedNavButtonClass}
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
                        <BookOpen className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Documentation</span>}
                        {!collapsed && (
                          <ChevronDown className="ml-auto h-4 w-4" />
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
                <Tooltip open={false}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={restrictedNavButtonClass}
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
                        <FileText className="h-5 w-5 shrink-0" />
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
            <Tooltip open={false}>
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
