import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Clock3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getMembershipStatusStudents,
  normalizeMembershipStatus,
  type MembershipGateStatus,
} from "@/features/student";

const readableStatus = (status: MembershipGateStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default function MembershipPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<MembershipGateStatus>("pending");
  const [isLoading, setIsLoading] = useState(true);

  const returnTo = useMemo(() => {
    const from = (location.state as { from?: string } | null)?.from;
    return from && !from.includes("membership")
      ? from
      : "/student/event-attendance";
  }, [location.state]);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    const result = await getMembershipStatusStudents(undefined, false);
    const nextStatus = normalizeMembershipStatus(
      result?.status || result?.rawStatus
    );

    if (nextStatus === "active") {
      navigate(returnTo, { replace: true });
      return;
    }

    if (nextStatus !== "pending") {
      navigate("/student/membership-required", { replace: true });
      return;
    }

    setStatus(nextStatus);
    setIsLoading(false);
  }, [navigate, returnTo]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
          <Clock3 className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-slate-950">
              Membership Pending
            </h2>
            <Badge variant="secondary">{readableStatus(status)}</Badge>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your membership request has been submitted and is waiting for admin
            or finance approval.
          </p>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Student-only features will unlock automatically once your membership
            is approved.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              className="gap-2 bg-[#1c9dde] hover:bg-[#168bc7]"
              onClick={loadStatus}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/student/account-settings">Account Settings</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
