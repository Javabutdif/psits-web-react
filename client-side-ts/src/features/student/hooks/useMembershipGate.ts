import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { getMembershipStatusStudents } from "../api/student";
import { normalizeMembershipStatus } from "../utils/membership";

export const useMembershipGate = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const ensureActiveMembership = useCallback(async () => {
    if (!isAuthenticated) {
      navigate("/auth/login", {
        state: { from: location.pathname },
      });
      return false;
    }

    if (user?.role !== "student") {
      return true;
    }

    if (user.year === 1 || user.year === "1") {
      return true;
    }

    const result = await getMembershipStatusStudents(undefined, false);
    const status = normalizeMembershipStatus(
      result?.status || result?.rawStatus
    );

    if (status === "active") {
      return true;
    }

    navigate(
      status === "pending"
        ? "/student/membership-pending"
        : "/student/membership-required",
      {
        state: { from: location.pathname },
      }
    );

    return false;
  }, [isAuthenticated, location.pathname, navigate, user?.role]);

  return { ensureActiveMembership };
};
