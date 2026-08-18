import { useState, useEffect } from "react";
import { getEmailQueue, resendEmail, exportEmailQueueCsv, triggerCron, getFailedEmailDetails, bulkUpdateEmailStatus } from "../api/devtools.api";
import type { EmailQueueEntry } from "../types/devtools.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface FailedEmail {
  _id: string;
  email: string;
  type: string;
  subtype?: string;
  referenceCode?: string;
  retryCount: number;
  timestamp: string;
  daysPending?: number;
  canResend: boolean;
}

export const EmailQueuePanel = () => {
  const [entries, setEntries] = useState<EmailQueueEntry[]>([]);
  const [counts, setCounts] = useState({ pending: 0, sent: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [resendAllConfirm, setResendAllConfirm] = useState(false);
  const [failedEmails, setFailedEmails] = useState<FailedEmail[]>([]);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [selectedFailed, setSelectedFailed] = useState<Set<string>>(new Set());

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await getEmailQueue(
        filter ? { status: filter, limit: pageSize, skip: (page - 1) * pageSize } : { limit: pageSize, skip: (page - 1) * pageSize }
      );
      setEntries(data.data);
      setTotal(data.total);
    } catch {
      showToast("error", "Failed to load email queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    fetchEntries();
  }, [page, filter]);

  const loadFailedEmails = async () => {
    setLoadingFailed(true);
    try {
      const data = await getFailedEmailDetails(100);
      setFailedEmails(data);
    } catch {
      // silently fail
    } finally {
      setLoadingFailed(false);
    }
  };

  const loadCounts = async () => {
    try {
      const [pendingData, sentData] = await Promise.all([
        getEmailQueue({ status: "pending", limit: 1, skip: 0 }),
        getEmailQueue({ status: "sent", limit: 1, skip: 0 }),
      ]);
      setCounts({ pending: pendingData.total, sent: sentData.total });
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    loadFailedEmails();
  }, []);

  useEffect(() => {
    loadFailedEmails();
    loadCounts();
  }, []);

  const handleResend = async (id: string) => {
    try {
      await resendEmail(id);
      showToast("success", "Email resent successfully");
      fetchEntries();
      loadFailedEmails();
      loadCounts();
    } catch {
      showToast("error", "Failed to resend email");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportEmailQueueCsv(filter ? { status: filter } : undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `email-queue-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("error", "Failed to export CSV");
    }
  };

  const handleResendAll = async () => {
    try {
      await triggerCron("email-resend");
      showToast("success", "Email resend job triggered");
      setResendAllConfirm(false);
      fetchEntries();
      loadFailedEmails();
      loadCounts();
    } catch {
      showToast("error", "Failed to trigger resend");
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (status === "sent") return `${base} bg-green-50 text-green-600`;
    if (status === "failed") return `${base} bg-red-50 text-red-600`;
    return `${base} bg-orange-50 text-orange-600`;
  };

  const totalPages = Math.ceil(total / pageSize);
  const pendingEntries = entries.filter((e) => e.status === "pending").length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center rounded-full bg-[#f1f1f1] p-1">
      {[
        { value: "", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "sent", label: "Sent" },
        { value: "failed", label: "Failed" },
      ].map((option) => {
        const active = filter === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-4 py-2 text-sm transition-all ${
              active
                ? "bg-white text-[#303030] shadow-sm"
                : "text-[#666] hover:text-[#303030]"
            }`}
          >
            {option.label}

            {option.value === "failed" && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
                {failedEmails.length}
              </span>
            )}

            {option.value === "pending" && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-[11px] font-medium text-yellow-700">
                {counts.pending}
              </span>
            )}

            {option.value === "sent" && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-green-100 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
                {counts.sent}
              </span>
            )}
                      </button>
                    );
                  })}
                </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-[#e5e5e5] bg-white px-5 text-sm"
          onClick={fetchEntries}
        >
          Refresh
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-[#e5e5e5] bg-white px-5 text-sm"
          onClick={handleExport}
        >
          Export CSV
        </Button>

        {pendingEntries > 0 && (
          <Button
            type="button"
            size="sm"
            className="h-10 rounded-full bg-[#1c9dde] px-5 text-sm hover:bg-[#168bc7]"
            onClick={() => setResendAllConfirm(true)}
          >
            Resend All Pending ({pendingEntries})
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#777]">No email queue entries found.</p>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[14%]" />
                <col className="w-[9%]" />
                <col className="w-[7%]" />
                <col className="w-[18%]" />
                <col className="w-[17%]" />
              </colgroup>

              <thead>
                <tr className="bg-[#efefef] text-[#2f2f2f]">
                  <th className="rounded-l-xl px-2.5 py-2.5 text-left font-medium">
                    Reference Code
                  </th>

                  <th className="px-2.5 py-2.5 text-left font-medium">
                    Email
                  </th>

                  <th className="px-2.5 py-2.5 text-left font-medium">
                    Type
                  </th>

                  <th className="px-1.5 py-2.5 text-left font-medium">
                    Status
                  </th>

                  <th className="px-1 py-2.5 text-center font-medium">
                    Retries
                  </th>

                  <th className="px-2.5 py-2.5 text-left font-medium">
                    Timestamp
                  </th>

                  <th className="rounded-r-xl px-2.5 py-2.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="border-b border-[#ededed] text-[#303030] last:border-b-0"
                  >
                    <td className="truncate px-2.5 py-3.5">
                      {entry.referenceCode || "-"}
                    </td>

                    <td className="truncate px-2.5 py-3.5">
                      {entry.email}
                    </td>

                    <td className="overflow-hidden px-2.5 py-3.5">
                      <div
                        className="truncate whitespace-nowrap"
                        title={entry.subtype || entry.type}
                      >
                        {entry.subtype || entry.type}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-1.5 py-3.5">
                      <span className={getStatusBadge(entry.status)}>
                        {entry.status}
                      </span>
                    </td>

                    {/* Retries - intentionally tight to Status */}
                    <td className="px-1 py-3.5 text-center">
                      {entry.retryCount >= 3 ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          {entry.retryCount}
                        </span>
                      ) : (
                        entry.retryCount
                      )}
                    </td>

                    <td className="truncate px-2.5 py-3.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>

                    <td className="px-2.5 py-3.5 text-right">
                      {entry.status === "pending" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-full border-[#e8e8e8] px-3 text-xs"
                          onClick={() => handleResend(entry._id)}
                        >
                          Resend
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-[#8a8a8a]">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#8a8a8a]">Page {page} of {totalPages}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={resendAllConfirm} onOpenChange={setResendAllConfirm}>
        <DialogContent className="max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Resend all pending emails?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#777]">
            This will trigger the email resend cron job for all pending entries.
          </p>
          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setResendAllConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
              onClick={handleResendAll}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
