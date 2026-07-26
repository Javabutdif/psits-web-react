import { useState, useEffect } from "react";
import { getEnvStatus } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";

export const EnvInspectorPanel = () => {
  const [envs, setEnvs] = useState<any[]>([]);
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
      {envs.map((env) => (
        <div
          key={env.key}
          className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[#1c9dde]">
            {env.configured ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{env.key}</p>
            <p className="mt-1 text-sm font-semibold text-[#2b2b2b] truncate">
              {env.value || "Not configured"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
