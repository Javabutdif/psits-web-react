import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getMembershipStatusStudents,
  requestMembership,
  normalizeMembershipStatus,
  type MembershipGateStatus,
} from "@/features/student";

type MembershipInfo = {
  status: MembershipGateStatus;
  rawStatus?: string;
  isFirstApplication: boolean;
  membershipPrice: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const readableStatus = (status: MembershipGateStatus) => {
  if (status === "none") return "Not applied";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function MembershipRequired() {
  const navigate = useNavigate();
  const location = useLocation();
  const [info, setInfo] = useState<MembershipInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnTo = useMemo(() => {
    const from = (location.state as { from?: string } | null)?.from;
    return from && !from.includes("membership")
      ? from
      : "/student/event-attendance";
  }, [location.state]);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      setIsLoading(true);
      const result = await getMembershipStatusStudents(undefined, false);

      if (cancelled) return;

      const status = normalizeMembershipStatus(
        result?.status || result?.rawStatus
      );

      if (status === "active") {
        navigate(returnTo, { replace: true });
        return;
      }

      if (status === "pending") {
        navigate("/student/membership-pending", { replace: true });
        return;
      }

      setInfo({
        status,
        rawStatus: result?.rawStatus,
        isFirstApplication: Boolean(result?.isFirstApplication),
        membershipPrice: result?.membershipPrice ?? 0,
      });
      setIsLoading(false);
    };

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [navigate, returnTo]);

  const handleRequestMembership = async () => {
    setIsSubmitting(true);
    const result = await requestMembership();
    setIsSubmitting(false);

    if (normalizeMembershipStatus(result?.status || result?.rawStatus) === "pending") {
      navigate("/student/membership-pending", { replace: true });
    }
  };

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
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600">
          <WalletCards className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-slate-950">
              Membership Required
            </h2>
            <Badge variant="secondary">
              {readableStatus(info?.status ?? "none")}
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            An active PSITS membership is required before you can access student
            attendance, certificates, cart, checkout, and orders.
          </p>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Membership fee
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Approval is handled by admin or finance.
                </p>
              </div>
              <p className="text-xl font-semibold text-sky-600">
                {formatCurrency(info?.membershipPrice ?? 0)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              className="gap-2 bg-[#1c9dde] hover:bg-[#168bc7]"
              disabled={isSubmitting}
              onClick={handleRequestMembership}
            >
              {isSubmitting ? "Submitting..." : "Purchase Membership"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/student/account-settings">Account Settings</Link>
            </Button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <BadgeCheck className="h-4 w-4 text-sky-500" />
            Your access unlocks automatically after approval.
          </div>
        </div>
      </div>
    </Card>
  );
}
