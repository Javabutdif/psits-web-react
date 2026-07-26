import { useState, useEffect } from "react";
import { getDbPerformance, rebuildDbIndexes } from "../api/devtools.api";
import type { CollectionStat } from "../types/devtools.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";
import { Database, AlertTriangle, RefreshCw } from "lucide-react";

export const DbPerformancePanel = () => {
  const [stats, setStats] = useState<CollectionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDbPerformance();
      setStats(data);
    } catch {
      showToast("error", "Failed to load database stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      const result = await rebuildDbIndexes();
      showToast("success", `${result.message}`);
      fetchStats();
    } catch {
      showToast("error", "Failed to rebuild indexes");
    } finally {
      setRebuilding(false);
    }
  };

  const warningCount = stats.filter((s) => s.warning).length;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8a8a8a]">{stats.length} collections</span>
          {warningCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
              <AlertTriangle className="h-3 w-3" />
              {warningCount} warning(s)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={fetchStats}
          >
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
            disabled={rebuilding}
            onClick={() => {
              if (window.confirm("This will rebuild indexes on all collections. Continue?")) {
                handleRebuild();
              }
            }}
          >
            <RefreshCw className={`mr-1 h-3 w-3 ${rebuilding ? "animate-spin" : ""}`} />
            Rebuild Indexes
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[20%] rounded-l-md px-2 py-2 text-left font-medium">Collection</th>
              <th className="w-[12%] px-2 py-2 text-center font-medium">Docs</th>
              <th className="w-[15%] px-2 py-2 text-center font-medium">Avg Size</th>
              <th className="w-[15%] px-2 py-2 text-center font-medium">Storage</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">Warnings</th>
              <th className="w-[23%] rounded-r-md px-2 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr key={stat.name} className={`border-b border-[#ededed] text-[#303030] ${stat.warning ? "bg-yellow-50" : ""}`}>
                <td className="truncate px-2 py-3 font-medium">{stat.name}</td>
                <td className="px-2 py-3 text-center">{stat.docs.toLocaleString()}</td>
                <td className="px-2 py-3 text-center">{(stat.avgObjSize / 1024).toFixed(1)} KB</td>
                <td className="px-2 py-3 text-center">{stat.storageSize} KB</td>
                <td className="px-2 py-3">
                  {stat.warning ? (
                    <span className="flex items-center gap-1 text-xs text-yellow-700">
                      <AlertTriangle className="h-3 w-3" />
                      {stat.warning}
                    </span>
                  ) : (
                    <span className="text-xs text-green-600">OK</span>
                  )}
                </td>
                <td className="px-2 py-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full text-xs"
                    onClick={() => {
                      // Could add more detailed view in future
                    }}
                  >
                    <Database className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
