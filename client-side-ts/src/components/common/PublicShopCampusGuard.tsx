import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";
import type { Campus } from "@/features/auth/types/auth.types";
import { showToast } from "@/utils/alertHelper";

const SHOP_ALLOWED_CAMPUSES: Campus[] = ["UC-MAIN", "UC-CS"];

export const PublicShopCampusGuard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasShownToastRef = useRef(false);

  const userCampus = user?.campus;
  const isBlocked =
    !isLoading &&
    isAuthenticated &&
    userCampus !== undefined &&
    !SHOP_ALLOWED_CAMPUSES.includes(userCampus);

  useEffect(() => {
    if (isBlocked && !hasShownToastRef.current) {
      hasShownToastRef.current = true;
      showToast(
        "error",
        "Shop and cart are currently available for UC-MAIN and UC-CS accounts only."
      );
    }
  }, [isBlocked]);

  if (isLoading) {
    return null;
  }

  if (!isBlocked) {
    return <Outlet />;
  }

  const fallback =
    user?.role === "admin" ? "/admin/events" : "/student/event-attendance";
  return <Navigate to={fallback} replace />;
};
