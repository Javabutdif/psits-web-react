import { useState, useEffect } from "react";
import { getEmailQueue, resendEmail } from "../api/devtools.api";
import type { EmailQueueEntry } from "../types/devtools.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";

export const EmailQueuePanel = () => {
  const [entries, setEntries] = useState<EmailQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await getEmailQueue(filter ? { status: filter } : undefined);
      setEntries(data);
    } catch {
      showToast("error", "Failed to load email queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const handleResend = async (id: string) => {
    try {
      await resendEmail(id);
      showToast("success", "Email resent successfully");
      fetchEntries();
    } catch {
      showToast("error", "Failed to resend email");
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (status === "sent") return `${base} bg-green-50 text-green-600`;
    if (status === "failed") return `${base} bg-red-50 text-red-600`;
    return `${base} bg-orange-50 text-orange-600`;
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed border-collapse text-sm">
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
                  <td className="px-2 py-3 text-center">{entry.retryCount}</td>
                  <td className="px-2 py-3">
                    {new Date(entry.timestamp).toLocaleDateString()}
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
      )}
    </div>
  );
};
