import { useState, useEffect } from "react";
import { searchAdmins, invalidateSession } from "../api/devtools.api";
import type { AdminInfo } from "../types/devtools.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, KeyRound, Shield, MapPin, User } from "lucide-react";

export const AdminLookupPanel = () => {
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [invalidatingId, setInvalidatingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; adminId: string; adminName: string }>({
    open: false,
    adminId: "",
    adminName: "",
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pageSize,
        skip: (page - 1) * pageSize,
      };
      if (searchQuery) params.query = searchQuery;

      const data = await searchAdmins(params);
      setAdmins(data.data);
      setTotal(data.total);
    } catch {
      showToast("error", "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchAdmins();
  }, [page, searchQuery]);

  const handleInvalidate = async (adminId: string, adminName: string) => {
    setConfirmDialog({ open: true, adminId, adminName });
  };

  const confirmInvalidate = async () => {
    if (!confirmDialog.adminId) return;
    setInvalidatingId(confirmDialog.adminId);
    try {
      await invalidateSession(confirmDialog.adminId);
      showToast("success", `Session invalidated for ${confirmDialog.adminName}`);
      fetchAdmins();
    } catch {
      showToast("error", "Failed to invalidate session");
    } finally {
      setInvalidatingId(null);
      setConfirmDialog({ open: false, adminId: "", adminName: "" });
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (status === "ACTIVE") return `${base} bg-green-50 text-green-600`;
    if (status === "SUSPENDED") return `${base} bg-red-50 text-red-600`;
    return `${base} bg-gray-50 text-gray-600`;
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

  if (admins.length === 0) {
    return <p className="py-16 text-center text-sm text-[#777]">No admins found.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#858585]" />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border-[#ececec] bg-white pl-9 pr-3 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={fetchAdmins}
        >
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[15%] rounded-l-md px-2 py-2 text-left font-medium">Name</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">ID Number</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">Campus</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">Position</th>
              <th className="w-[12%] px-2 py-2 text-left font-medium">Access</th>
              <th className="w-[12%] px-2 py-2 text-left font-medium">Status</th>
              <th className="w-[16%] rounded-r-md px-2 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-b border-[#ededed] text-[#303030] hover:bg-[#fafafa]">
                <td className="truncate px-2 py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#858585]" />
                    {admin.name}
                  </div>
                </td>
                <td className="px-2 py-3 font-mono text-xs">{admin.id_number}</td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#858585]" />
                    {admin.campus}
                  </div>
                </td>
                <td className="px-2 py-3">{admin.position || "-"}</td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-[#858585]" />
                    {admin.access}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <span className={getStatusBadge(admin.status)}>
                    {admin.status}
                  </span>
                </td>
                <td className="px-2 py-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full text-xs border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleInvalidate(admin._id, admin.name)}
                    disabled={invalidatingId === admin._id}
                  >
                    <KeyRound className="mr-1 h-3 w-3" />
                    Invalidate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-[#8a8a8a]">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-[#8a8a8a]">Page {page} of {totalPages}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent className="max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Confirm session invalidation?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#777]">
            This will force logout <span className="font-medium">{confirmDialog.adminName}</span>. They will need to log in again.
          </p>
          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setConfirmDialog({ open: false, adminId: "", adminName: "" })}
              disabled={invalidatingId !== null}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-red-500 hover:bg-red-600"
              onClick={confirmInvalidate}
              disabled={invalidatingId !== null}
            >
              {invalidatingId ? "Invalidating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};