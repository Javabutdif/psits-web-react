import { useState, useEffect } from "react";
import { getEnvStatus } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";
import type { EnvStatusItem } from "../types/devtools.types";

export const EnvInspectorPanel = () => {
  const [envs, setEnvs] = useState<EnvStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEnvStatus()
      .then(setEnvs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {envs.map((env) => {
        // Anything unset reads as an error, optional or not — an unset variable
        // is worth acting on either way, and the old amber-triangle state was
        // easy to skim past.
        const isMissing = !env.configured;

        return (
          <div
            key={env.key}
            className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${
              isMissing
                ? "border-red-200 bg-red-50"
                : "border-[#e5e5e5] bg-white"
            }`}
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[#1c9dde]">
              {env.configured ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {env.key}
              </p>
              <p
                className={`mt-1 truncate text-sm font-semibold ${
                  isMissing ? "text-red-600" : "text-[#2b2b2b]"
                }`}
              >
                {env.configured ? "Configured" : "Not configured"}
              </p>
            </div>
            {(env.required || isMissing) && (
              <div
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  isMissing
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Required
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
