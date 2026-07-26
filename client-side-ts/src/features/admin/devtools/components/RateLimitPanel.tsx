import { useState, useEffect } from "react";
import { getRateLimitStats } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertTriangle } from "lucide-react";

export const RateLimitPanel = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRateLimitStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-2xl" />
        ))}
      </div>
    );
  }

  const isHighLimit = stats?.maxRequests > 500;

  return (
    <div>
      {isHighLimit && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
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
    </div>
  );
};
