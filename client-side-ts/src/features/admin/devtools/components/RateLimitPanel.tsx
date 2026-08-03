import { useState, useEffect } from "react";
import { getRateLimitStats, getRateLimitViolations } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertTriangle, Clock } from "lucide-react";

interface Violation {
  ip: string;
  path: string;
  timestamp: string;
}

export const RateLimitPanel = () => {
  const [stats, setStats] = useState<any>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRateLimitStats().then(setStats),
      getRateLimitViolations(20).then(setViolations),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const isHighLimit = stats?.maxRequests > 500;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-PH", { timeZone: "Asia/Manila" });
  };

  return (
    <div className="space-y-4">
      {isHighLimit && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-yellow-700">High rate limit detected</p>
            <p className="text-xs text-yellow-600">Current limit ({stats.maxRequests} req/window) may be too permissive for production.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Window</p>
            <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">{(stats.windowMs / 60000)} min</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Max Requests</p>
            <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">{stats.maxRequests}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Blocked Today</p>
            <p className={`mt-1 text-xl font-semibold ${stats.blockedToday > 0 ? "text-red-600" : "text-[#2b2b2b]"}`}>
              {stats.blockedToday}
            </p>
          </div>
        </div>
      </div>

      {violations.length > 0 && (
        <div className="rounded-xl border border-[#e5e5e5] bg-white">
          <div className="border-b border-[#ededed] px-5 py-3">
            <h3 className="text-sm font-medium text-[#2b2b2b]">Recent Violations ({violations.length})</h3>
          </div>
          <div className="divide-y divide-[#ededed]">
            {violations.slice(0, 10).map((v, idx) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2b2b2b]">{v.ip}</p>
                  <p className="text-xs text-[#858585]">{v.path}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#858585]">
                  <Clock className="h-3 w-3" />
                  {formatTime(v.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};