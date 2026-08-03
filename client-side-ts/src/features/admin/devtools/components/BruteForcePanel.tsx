import { useState, useEffect } from "react";
import { getBruteForceLogs } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Shield } from "lucide-react";

interface BruteForceEntry {
  ip: string;
  count: number;
  lastAttempt: string;
  attempts: Array<{ timestamp: string }>;
}

export const BruteForcePanel = () => {
  const [logs, setLogs] = useState<BruteForceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getBruteForceLogs(threshold);
      setLogs(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [threshold]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700">No suspicious activity detected</p>
              <p className="text-xs text-green-600">No IPs exceed the threshold of {threshold} failed attempts.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Threshold:</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="h-8 rounded-lg border-[#ececec] bg-white px-3 text-sm"
          >
            <option value={3}>3 attempts</option>
            <option value={5}>5 attempts</option>
            <option value={10}>10 attempts</option>
            <option value={20}>20 attempts</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="text-sm font-semibold text-[#2b2b2b]">Suspicious IPs ({logs.length})</h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Threshold:</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="h-8 rounded-lg border-[#ececec] bg-white px-3 text-sm"
          >
            <option value={3}>3 attempts</option>
            <option value={5}>5 attempts</option>
            <option value={10}>10 attempts</option>
            <option value={20}>20 attempts</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[25%] rounded-l-md px-3 py-2 text-left font-medium">IP Address</th>
              <th className="w-[15%] px-3 py-2 text-left font-medium">Failed Attempts</th>
              <th className="w-[25%] px-3 py-2 text-left font-medium">Last Attempt</th>
              <th className="w-[35%] rounded-r-md px-3 py-2 text-left font-medium">Recent Activity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.ip} className="border-b border-[#ededed] hover:bg-orange-50">
                <td className="px-3 py-3 font-mono text-sm">{log.ip}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    log.count >= 20 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {log.count}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm">{new Date(log.lastAttempt).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {log.attempts.slice(-5).map((a, i) => (
                    <div key={i}>{new Date(a.timestamp).toLocaleString("en-PH", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" })}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};