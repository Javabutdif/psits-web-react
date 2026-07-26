import { useState, useEffect } from "react";
import { getSessions, invalidateBulkSessions } from "../api/devtools.api";
import type { SessionInfo } from "../types/devtools.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { showToast } from "@/utils/alertHelper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const SessionManagerPanel = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [invalidating, setInvalidating] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch {
      showToast("error", "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === sessions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sessions.map((s) => s.id)));
    }
  };

  const handleBulkInvalidate = async () => {
    setInvalidating(true);
    try {
      await invalidateBulkSessions(Array.from(selected));
      showToast("success", `${selected.size} session(s) invalidated`);
      setSelected(new Set());
      fetchSessions();
    } catch {
      showToast("error", "Failed to invalidate sessions");
    } finally {
      setInvalidating(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return <p className="py-16 text-center text-sm text-[#777]">No active sessions found.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8a8a8a]">{sessions.length} active session(s)</span>
          {selected.size > 0 && (
            <span className="rounded-full bg-[#1c9dde] px-2 py-0.5 text-xs font-medium text-white">
              {selected.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="rounded-full"
              onClick={() => setConfirmOpen(true)}
              disabled={invalidating}
            >
              Invalidate Selected ({selected.size})
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={fetchSessions}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-10 rounded-l-md px-2 py-2 text-center">
                <Checkbox
                  checked={selected.size === sessions.length && sessions.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="w-[20%] px-2 py-2 text-left font-medium">Name</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">ID Number</th>
              <th className="w-[12%] px-2 py-2 text-left font-medium">Role</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">Campus</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">Position</th>
              <th className="w-[13%] rounded-r-md px-2 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-[#ededed] text-[#303030]">
                <td className="px-2 py-3 text-center">
                  <Checkbox
                    checked={selected.has(session.id)}
                    onCheckedChange={() => toggleSelect(session.id)}
                    aria-label={`Select ${session.name}`}
                  />
                </td>
                <td className="truncate px-2 py-3">{session.name}</td>
                <td className="px-2 py-3">{session.idNumber}</td>
                <td className="px-2 py-3 capitalize">{session.role}</td>
                <td className="px-2 py-3">{session.campus || "-"}</td>
                <td className="truncate px-2 py-3">{session.position || "-"}</td>
                <td className="px-2 py-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelected((prev) => new Set([...prev, session.id]));
                      setConfirmOpen(true);
                    }}
                  >
                    Invalidate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Invalidate {selected.size} session(s)?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#777]">
            This will force logout the selected users. They will need to log in again.
          </p>
          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmOpen(false)}
              disabled={invalidating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-red-500 hover:bg-red-600"
              onClick={handleBulkInvalidate}
              disabled={invalidating}
            >
              {invalidating ? "Invalidating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
