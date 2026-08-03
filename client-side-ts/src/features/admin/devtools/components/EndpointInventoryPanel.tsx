import { useState, useEffect } from "react";
import { getEndpointInventory } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Code } from "lucide-react";

interface Endpoint {
  method: string;
  path: string;
  auth: string;
}

export const EndpointInventoryPanel = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEndpointInventory()
      .then(setEndpoints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const methodColors: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-yellow-100 text-yellow-700",
    PATCH: "bg-purple-100 text-purple-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Code className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p>Registered API endpoints with their authentication requirements.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[10%] rounded-l-md px-3 py-2 text-left font-medium">Method</th>
              <th className="w-[50%] px-3 py-2 text-left font-medium">Path</th>
              <th className="w-[40%] rounded-r-md px-3 py-2 text-left font-medium">Auth Required</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep, idx) => (
              <tr key={idx} className="border-b border-[#ededed] hover:bg-gray-50">
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${methodColors[ep.method] || "bg-gray-100 text-gray-700"}`}>
                    {ep.method}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-xs">{ep.path}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Shield className="h-3 w-3" />
                    {ep.auth}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};