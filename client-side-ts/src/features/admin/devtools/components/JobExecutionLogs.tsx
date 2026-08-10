import { useState, useEffect } from "react";
import { getJobLogs } from "../api/automation.api";
import type { ExecutionLog } from "../types/automation.types";
import { Skeleton } from "@/components/ui/skeleton";

interface JobExecutionLogsProps {
  jobId: string;
}

export const JobExecutionLogs = ({ jobId }: JobExecutionLogsProps) => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getJobLogs(jobId, { limit: 10 });
      setLogs(res.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [jobId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return <p className="text-sm text-[#8a8a8a]">No execution logs yet.</p>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log._id}
          className="flex items-center justify-between rounded-lg border border-[#f0f0f0] bg-[#fafafa] p-3"
        >
          <div>
            <p className={`text-sm font-medium ${log.success ? "text-green-600" : "text-red-600"}`}>
              {log.success ? "Success" : "Failed"}
            </p>
            <p className="text-xs text-[#8a8a8a]">
              {new Date(log.startedAt).toLocaleString()}
              {log.durationMs && ` · ${(log.durationMs / 1000).toFixed(1)}s`}
            </p>
            {log.errorMessage && (
              <p className="mt-1 text-xs text-red-500">{log.errorMessage}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
