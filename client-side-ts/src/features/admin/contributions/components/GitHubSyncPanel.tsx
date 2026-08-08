import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SyncStatus } from "../types/contribution.types";

interface GitHubSyncPanelProps {
  isSyncing: boolean;
  syncStatus: SyncStatus | null;
  onSync: () => void;
  hasDevAccess: boolean;
}

export const GitHubSyncPanel = ({
  isSyncing,
  syncStatus,
  onSync,
  hasDevAccess,
}: GitHubSyncPanelProps) => {
  if (!hasDevAccess) return null;

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-[#f8fafc] p-4">
      <div className="mb-3 flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-[#1c9dde]" />
        <span className="text-sm font-medium">GitHub Developer Sync</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-[#666]">
        {syncStatus?.lastSyncedAt ? (
          <span className="flex items-center gap-1">
            {syncStatus.status === "success" ? (
              <CheckCircle className="h-3 w-3 text-emerald-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            Last sync:{" "}
            {new Date(syncStatus.lastSyncedAt).toLocaleString()}
          </span>
        ) : (
          <span className="text-[#999]">No sync history</span>
        )}
        {syncStatus && (
          <span>Developers tracked: {syncStatus.developerCount}</span>
        )}
      </div>

      {syncStatus?.errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <span className="font-medium">Sync warning:</span>{" "}
          {syncStatus.errorMessage}
        </div>
      )}

      <Button
        type="button"
        disabled={isSyncing}
        onClick={onSync}
        className="h-8 rounded-full bg-[#1c9dde] px-4 text-xs hover:bg-[#168bc7]"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Syncing...
          </>
        ) : (
          "Sync Developer Contributions"
        )}
      </Button>
    </div>
  );
};