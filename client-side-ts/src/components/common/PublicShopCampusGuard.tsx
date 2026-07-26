import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";
import type { Campus } from "@/features/auth/types/auth.types";
import { normalizeCampus } from "@/features/auth/utils/campus";
import { showToast } from "@/utils/alertHelper";

const SHOP_ALLOWED_CAMPUSES: Campus[] = ["UC-MAIN", "UC-CS"];

export const PublicShopCampusGuard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const hasShownToastRef = useRef(false);

  const userCampus = user?.campus;
  const normalizedUserCampus = normalizeCampus(userCampus);

  const isBlocked =
    !isLoading &&
    isAuthenticated &&
    userCampus !== undefined &&
    userCampus !== null &&
    !SHOP_ALLOWED_CAMPUSES.some(
      (campus) => normalizeCampus(campus) === normalizedUserCampus
    );

  useEffect(() => {
    if (isBlocked && !hasShownToastRef.current) {
      hasShownToastRef.current = true;
      showToast(
        "error",
        `Shop and cart are currently available for UC-MAIN and UC-CS accounts only. Your account is registered to: ${userCampus || "Unknown"}`
      );
    }
  }, [isBlocked, userCampus]);

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
