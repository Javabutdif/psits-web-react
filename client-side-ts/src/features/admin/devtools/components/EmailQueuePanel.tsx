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

  useEffect(() => {
    loadFailedEmails();
  }, []);

  const handleResend = async (id: string) => {
    try {
      await resendEmail(id);
      showToast("success", "Email resent successfully");
      fetchEntries();
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
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 rounded-lg border-[#ececec] bg-white px-3 text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={fetchEntries}
        >
          Refresh
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleExport}
        >
          Export CSV
        </Button>
        {pendingEntries > 0 && (
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
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
              <thead>
                <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                  <th className="w-[15%] rounded-l-md px-2 py-2 text-left font-medium">Reference Code</th>
                  <th className="w-[20%] px-2 py-2 text-left font-medium">Email</th>
                  <th className="w-[10%] px-2 py-2 text-left font-medium">Type</th>
                  <th className="w-[12%] px-2 py-2 text-left font-medium">Status</th>
                  <th className="w-[8%] px-2 py-2 text-center font-medium">Retries</th>
                  <th className="w-[15%] px-2 py-2 text-left font-medium">Timestamp</th>
                  <th className="w-[20%] rounded-r-md px-2 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id} className="border-b border-[#ededed] text-[#303030]">
                    <td className="truncate px-2 py-3">{entry.referenceCode || "-"}</td>
                    <td className="truncate px-2 py-3">{entry.email}</td>
                    <td className="px-2 py-3">{entry.subtype || entry.type}</td>
                    <td className="px-2 py-3">
                      <span className={getStatusBadge(entry.status)}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      {entry.retryCount >= 3 ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          {entry.retryCount}
                        </span>
                      ) : (
                        entry.retryCount
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {entry.status === "pending" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-full border-[#e8e8e8] text-xs"
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

      {/* Failed Emails Section */}
      <div className="mt-6 border-t border-[#e5e5e5] pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-semibold text-[#2b2b2b]">Failed Emails</h3>
            {failedEmails.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {failedEmails.length}
              </span>
            )}
          </div>
          {selectedFailed.size > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full text-xs border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                bulkUpdateEmailStatus(Array.from(selectedFailed), "pending")
                  .then(() => {
                    showToast("success", `Requeued ${selectedFailed.size} email(s)`);
                    setSelectedFailed(new Set());
                    loadFailedEmails();
                  })
                  .catch(() => showToast("error", "Failed to update emails"));
              }}
            >
              Requeue Selected ({selectedFailed.size})
            </Button>
          )}
        </div>

        {loadingFailed ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : failedEmails.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#777]">No failed emails found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b bg-[#fef2f2] text-left text-sm text-[#2f2f2f]">
                  <th className="w-10 px-3 py-2"></th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Reference</th>
                  <th className="px-3 py-2 font-medium">Retries</th>
                  <th className="px-3 py-2 font-medium">Days Pending</th>
                  <th className="px-3 py-2 font-medium">First Attempt</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {failedEmails.map((email) => (
                  <tr key={email._id} className="border-b border-[#fed7d7] hover:bg-red-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedFailed.has(email._id)}
                        onChange={(e) => {
                          const next = new Set(selectedFailed);
                          if (e.target.checked) next.add(email._id);
                          else next.delete(email._id);
                          setSelectedFailed(next);
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="truncate px-3 py-2">{email.email}</td>
                    <td className="px-3 py-2">{email.type}</td>
                    <td className="truncate px-3 py-2 font-mono text-xs">{email.referenceCode || "-"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        email.retryCount >= 3 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {email.retryCount}
                      </span>
                    </td>
                    <td className="px-3 py-2">{email.daysPending ?? "-"}</td>
                    <td className="px-3 py-2 text-xs">{new Date(email.timestamp).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      {email.canResend ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-full text-xs"
                          onClick={() => resendEmail(email._id).then(() => loadFailedEmails()).catch(() => showToast("error", "Failed to resend"))}
                        >
                          Resend
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">Max retries</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
