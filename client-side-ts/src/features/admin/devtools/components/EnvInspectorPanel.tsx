import { useState, useEffect } from "react";
import { getEnvStatus } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { EnvStatusItem } from "../types/devtools.types";

const REQUIRED_KEYS = new Set(["EMAIL", "RESEND_API_KEY", "BASE_URL", "MONGO_URI"]);

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
        const isMissingRequired = env.required && !env.configured;

        return (
          <div
            key={env.key}
            className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${
              isMissingRequired
                ? "border-red-200 bg-red-50"
                : env.configured
                  ? "border-[#e5e5e5] bg-white"
                  : "border-yellow-200 bg-yellow-50"
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
                className={`mt-1 text-sm font-semibold truncate ${
                  isMissingRequired ? "text-red-600" : "text-[#2b2b2b]"
                }`}
              >
                {env.configured ? "Configured" : "Not configured"}
              </p>
            </div>
            {(REQUIRED_KEYS.has(env.key) || env.required) && (
              <div
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  isMissingRequired
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Required
              </div>
            )}
            {!env.configured && !env.required && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600" />
            )}
          </div>
        );
      })}
    </div>
  );
};
