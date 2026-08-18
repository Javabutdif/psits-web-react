import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  getMembershipStatusStudents,
  normalizeMembershipStatus,
  type MembershipGateStatus,
} from "@/features/student";

type GuardState =
  | { kind: "loading" }
  | { kind: "ready"; status: MembershipGateStatus }
  | { kind: "error" };

export function StudentMembershipRouteGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [state, setState] = useState<GuardState>({ kind: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadMembership = async () => {
      if (isLoading) return;

      if (!isAuthenticated || user?.role !== "student") {
        setState({ kind: "ready", status: "active" });
        return;
      }

      setState({ kind: "loading" });
      const result = await getMembershipStatusStudents(undefined, false);

      if (cancelled) return;

      if (!result) {
        setState({ kind: "error" });
        return;
      }

      setState({
        kind: "ready",
        status: normalizeMembershipStatus(result.status || result.rawStatus),
      });
    };

    loadMembership();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    isLoading,
    user?.role,
    user?.idNumber,
    location.pathname,
    retryKey,
  ]);

  if (isLoading || state.kind === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-red-100 bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Unable to verify membership
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please try again before opening this page.
        </p>
        <Button
          className="mt-5"
          onClick={() => setRetryKey((key) => key + 1)}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (user?.role !== "student" || state.status === "active") {
    return <Outlet />;
  }

  if (user?.year === 1 || user?.year === "1") {
    return <Outlet />;
  }

  const redirectTo =
    state.status === "pending"
      ? "/student/membership-pending"
      : "/student/membership-required";

  return (
    <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  );
}
