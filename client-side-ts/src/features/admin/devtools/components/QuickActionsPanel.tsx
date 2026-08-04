import { useState } from "react";
import { triggerCron, cancelExpiredOrders, backfillCreatedAt, updateStudentYears } from "../api/devtools.api";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { BackfillResult, StudentYearUpdateResult } from "../types/devtools.types";

interface ActionButton {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
  adminOnly?: boolean;
}

const actions: ActionButton[] = [
  {
    key: "email-resend",
    label: "Run Email Resend Cron",
    description: "Resend all pending email queue entries",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    ),
  },
  {
    key: "promo-check",
    label: "Run Promo Check",
    description: "Check and clean up expired promotions",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20.59 13.41-7.67 7.67a2 2 0 0 1-2.83 0l-5-5a2 2 0 0 1 0-2.83L8.59 5.59"/><path d="m16 8 8 8"/></svg>
    ),
  },
  {
    key: "cancel-expired",
    label: "Cancel Expired Orders",
    description: "Delete pending orders older than 1 month and restore stock",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
  },
  {
    key: "backfill-created-at",
    label: "Backfill Created At",
    description: "Migration: Extract creation timestamp from ObjectId for all students",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    ),
    adminOnly: true,
  },
  {
    key: "update-student-years",
    label: "Update Student Years",
    description: "Increment year for students created >3 months ago (max year 4)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-4-4H13a4 4 0 0 0-4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
];

export const QuickActionsPanel = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [result, setResult] = useState<BackfillResult | StudentYearUpdateResult | null>(null);

  const handleAction = async (key: string) => {
    setLoading(key);
    setResult(null);
    try {
      if (key === "cancel-expired") {
        const data = await cancelExpiredOrders();
        showToast("success", `${data.data.cancelledCount} order(s) cancelled, ${data.data.restoredItems} item(s) restored`);
      } else if (key === "backfill-created-at") {
        const data = await backfillCreatedAt();
        const result = data.data;
        setResult(result);
        showToast("success", `Migrated ${result.migrated} student(s)`);
      } else if (key === "update-student-years") {
        const data = await updateStudentYears();
        const result = data.data;
        setResult(result);
        showToast("success", `Updated year for ${result.updated} student(s)`);
      } else {
        await triggerCron(key);
        showToast("success", "Action completed successfully");
      }
    } catch {
      showToast("error", "Failed to execute action");
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  const getLoadingText = (key: string) => {
    if (key === "cancel-expired") return "Cancelling...";
    if (key === "backfill-created-at") return "Migrating...";
    if (key === "update-student-years") return "Updating...";
    return "Running...";
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {actions.map((action) => (
        <div
          key={action.key}
          className="flex flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-5"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e9f4fb] text-[#1c9dde]">
              {action.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-[#2b2b2b]">{action.label}</p>
              <p className="text-xs text-[#8a8a8a]">{action.description}</p>
            </div>
          </div>
          <Button
            type="button"
            className={cn(
              "mt-2 h-9 w-full rounded-full",
              action.key === "promo-check"
                ? "bg-[#1c9dde] hover:bg-[#168bc7]"
                : "bg-[#1c9dde] hover:bg-[#168bc7]"
            )}
            disabled={loading !== null}
            onClick={() => setConfirmAction(action.key)}
          >
            {loading === action.key ? getLoadingText(action.key) : "Run Now"}
          </Button>
        </div>
      ))}

      {result && (
        <div className="col-span-full rounded-xl border border-[#e5e5e5] bg-white p-5">
          <p className="text-sm font-medium text-[#2b2b2b]">Result</p>
          <pre className="mt-2 text-xs text-[#666] bg-[#f5f5f5] p-3 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <Dialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Confirm action?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#777]">
            This will run the action for{" "}
            <span className="font-medium">{actions.find((a) => a.key === confirmAction)?.label}</span>.
          </p>
          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmAction(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
              onClick={() => confirmAction && handleAction(confirmAction)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
