import { useState } from "react";
import { triggerCron, cancelExpiredOrders } from "../api/devtools.api";
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

interface ActionButton {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
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
];

export const QuickActionsPanel = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleAction = async (key: string) => {
    setLoading(key);
    try {
      if (key === "cancel-expired") {
        const result = await cancelExpiredOrders();
        showToast("success", `${result.data.cancelledCount} order(s) cancelled, ${result.data.restoredItems} item(s) restored`);
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

      <Dialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Confirm action?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#777]">
            This will run the cron job for{" "}
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
