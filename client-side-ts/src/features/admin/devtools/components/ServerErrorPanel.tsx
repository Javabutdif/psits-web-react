import { useState, useEffect } from "react";
import { getErrors, clearErrors } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";
import { AlertCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface ServerErrorEntry {
  message: string;
  stack?: string;
  path: string;
  method: string;
  ip: string;
  timestamp: string;
}

export const ServerErrorPanel = () => {
  const [errors, setErrors] = useState<ServerErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const data = await getErrors(50);
      setErrors(data);
    } catch {
      showToast("error", "Failed to load error log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const toggleExpand = (timestamp: string) => {
    const next = new Set(expanded);
    if (next.has(timestamp)) next.delete(timestamp);
    else next.add(timestamp);
    setExpanded(next);
  };

  const handleClear = async () => {
    try {
      const result = await clearErrors();
      showToast("success", `Cleared ${result.cleared} error(s)`);
      setErrors([]);
    } catch {
      showToast("error", "Failed to clear errors");
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-PH", { timeZone: "Asia/Manila" });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (errors.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-sm text-green-700">No server errors recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h3 className="text-sm font-semibold text-[#2b2b2b]">Recent Server Errors ({errors.length})</h3>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-full text-xs"
          onClick={() => { fetchErrors(); }}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {errors.map((err) => (
          <div key={err.timestamp} className="rounded-xl border border-red-200 bg-red-50">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-mono font-medium text-red-700 shrink-0">
                  {err.method}
                </span>
                <span className="truncate font-mono text-sm text-[#2b2b2b]">{err.path}</span>
                <span className="text-xs text-gray-500 shrink-0">{err.ip}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <span className="text-xs text-gray-500">{formatTime(err.timestamp)}</span>
                <button
                  type="button"
                  onClick={() => toggleExpand(err.timestamp)}
                  className="rounded-full p-1 hover:bg-red-100"
                >
                  {expanded.has(err.timestamp) ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <div className="px-4 pb-2 text-sm text-red-700">
              {err.message}
            </div>
            {expanded.has(err.timestamp) && err.stack && (
              <div className="border-t border-red-200 px-4 py-3">
                <pre className="max-h-48 overflow-auto text-xs font-mono text-gray-600 whitespace-pre-wrap">
                  {err.stack}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-full text-xs border-red-300 text-red-600 hover:bg-red-50"
          onClick={handleClear}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Clear All Errors
        </Button>
      </div>
    </div>
  );
};