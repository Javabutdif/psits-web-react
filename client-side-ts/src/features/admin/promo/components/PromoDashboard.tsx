import { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Eye, PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showToast } from "@/utils/alertHelper";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminPermissions";
import { deletePromo } from "../api/promo.api";
import { PromoAddModal } from "./PromoAddModal";
import { PromoViewModal } from "./PromoViewModal";
import { PromoLogModal } from "./PromoLogModal";
import { PromoEditModal } from "./PromoEditModal";
import type { PromoListRow } from "../types/promo.types";
import { getAllPromoCodes } from "../api/promo.api";

const getStatusBadge = (start_date: string, end_date: string) => {
  const current = new Date();
  const start = new Date(start_date);
  const end = new Date(end_date);
  let badge: {
    label: string;
    variant: "default" | "secondary" | "destructive";
  } = {
    label: "Active",
    variant: "default",
  };
  if (current < start) {
    badge = { label: "Upcoming", variant: "secondary" };
  } else if (current > end) {
    badge = { label: "Expired", variant: "destructive" };
  }
  return badge;
};

const getStockDisplay = (limit_type: string, quantity: number) => {
  if (limit_type === "Unlimited") return "Unlimited";
  if (quantity <= 0)
    return { label: "Out of Stocks", color: "text-red-600 font-semibold" };
  return String(quantity);
};

// Pure fetch — no state writes. Shared by the mount effect and the
// button/mutation-triggered refetches below.
const loadPromoCodes = async (): Promise<PromoListRow[] | null> => {
  try {
    const data = await getAllPromoCodes();
    if (!data) {
      showToast("error", "Failed to fetch promo codes.");
      return null;
    }
    return data;
  } catch (error) {
    console.error(error);
    showToast("error", "Failed to fetch promo codes.");
    return null;
  }
};

export const PromoDashboard = () => {
  const { canManagePromo } = useAdminPermissions();
  const [promoCodes, setPromoCodes] = useState<PromoListRow[]>([]);
  // Defaults to true since we always fetch on mount — this lets the mount
  // effect below only ever set state *after* an await (the React-recommended
  // shape), instead of calling setIsLoading(true) synchronously inside the
  // effect, which is what react-hooks/set-state-in-effect flags.
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<PromoListRow | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<PromoListRow | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [deleteName, setDeleteName] = useState("");

  //Filter tab, search text, selected checkboxes
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Used for refetches triggered from event handlers (add/edit/delete
  // callbacks below) — these aren't inside an effect, so setting isLoading
  // synchronously here is fine.
  const refetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const data = await loadPromoCodes();
      if (data) setPromoCodes(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      const data = await loadPromoCodes();
      if (ignore) return;
      if (data) setPromoCodes(data);
      setIsLoading(false);
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const handleEdit = (row: PromoListRow) => {
    if (!canManagePromo) return;
    setEditData(row);
    setIsEditModalOpen(true);
  };

  const handleView = (row: PromoListRow) => {
    setViewData(row);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (row: PromoListRow) => {
    if (!canManagePromo) return;
    setDeleteId(row._id);
    setDeleteName(row.promo_name);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!canManagePromo) return;
    const result = await deletePromo(deleteId);
    if (result) {
      setIsDeleteConfirmOpen(false);
      setDeleteId("");
      setDeleteName("");
      refetchPromoCodes();
    }
  };

  // Promo Tab counts
  const countFor = (tab: string) =>
    promoCodes.filter((row) => {
      const status = getStatusBadge(row.start_date, row.end_date);
      const stock = getStockDisplay(row.limit_type, row.quantity);
      const isOutOfStock = typeof stock === "object";

      if (tab === "All") return true;
      if (tab === "Active") return status.label === "Active" && !isOutOfStock;
      if (tab === "Out of Stock") return isOutOfStock;
      if (tab === "Expired") return status.label === "Expired";
      return true;
    }).length;

  const tabs = ["All", "Active", "Out of Stock", "Expired"];

  // Promo Tab Filter
  const filteredCodes = promoCodes.filter((row) => {
    const status = getStatusBadge(row.start_date, row.end_date);
    const stock = getStockDisplay(row.limit_type, row.quantity);
    const isOutOfStock = typeof stock === "object";

    const matchesTab =
      activeFilter === "All" ||
      (activeFilter === "Active" &&
        status.label === "Active" &&
        !isOutOfStock) ||
      (activeFilter === "Out of Stock" && isOutOfStock) ||
      (activeFilter === "Expired" && status.label === "Expired");

    const matchesSearch = row.promo_name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const allSelected =
    filteredCodes.length > 0 &&
    filteredCodes.every((row) => selectedIds.includes(row._id));

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : filteredCodes.map((row) => row._id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#333]">
      <header className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Promo Code</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage discount codes and special offers
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-[#e8e8e8] px-4 text-sm"
            onClick={() => setIsLogModalOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Cleanup Log
          </Button>
          <Button
            type="button"
            className="h-9 rounded-full bg-[#1c9dde] px-5 hover:bg-[#168bc7]"
            onClick={() => setIsAddModalOpen(true)}
            disabled={!canManagePromo}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Promo Code
          </Button>
        </div>
      </header>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <section className="rounded-[22px] border border-[#e5e5e5] bg-white px-4 py-5 sm:px-6">
          {/* Filter tabs + search */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full bg-[#f2f2f2] p-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    activeFilter === tab
                      ? "bg-white text-[#303030] shadow-sm"
                      : "text-[#777] hover:text-[#303030]"
                  }`}
                >
                  {tab}{" "}
                  <span className="text-xs text-[#999]">{countFor(tab)}</span>
                </button>
              ))}
            </div>

            <div className="relative w-56">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full border-[#e0e0e0] pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                    <TableHead className="w-8 rounded-l-md py-2 pr-0 pl-2" />
                    <TableHead className="w-[28%] px-2 py-2 font-medium">
                      Promo Name
                    </TableHead>
                    <TableHead className="w-[12%] px-2 py-2 font-medium">
                      Type
                    </TableHead>
                    <TableHead className="w-[10%] px-2 py-2 font-medium">
                      Discount
                    </TableHead>
                    <TableHead className="w-[12%] px-2 py-2 font-medium">
                      Stocks
                    </TableHead>
                    <TableHead className="w-[12%] px-2 py-2 font-medium">
                      Status
                    </TableHead>
                    <TableHead className="w-[16%] rounded-r-md px-2 py-2 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-3 pr-0 pl-2">
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Skeleton className="h-4 w-32 rounded-full" />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="px-2 py-3">
                        <Skeleton className="h-7 w-24 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : filteredCodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                    <TableHead className="w-8 rounded-l-md py-2 pr-0 pl-2">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[28%] px-2 py-2 font-medium">
                      Promo Name
                    </TableHead>
                    <TableHead className="w-[12%] px-2 py-2 font-medium">
                      Type
                    </TableHead>
                    <TableHead className="w-[10%] px-2 py-2 font-medium">
                      Discount
                    </TableHead>
                    <TableHead className="w-[12%] px-2 py-2 font-medium">
                      Stocks
                    </TableHead>
                    <TableHead className="w-[12%] px-2 py-2 font-medium">
                      Status
                    </TableHead>
                    <TableHead className="w-[16%] rounded-r-md px-2 py-2 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((row: PromoListRow) => {
                    const status = getStatusBadge(row.start_date, row.end_date);
                    const stock = getStockDisplay(row.limit_type, row.quantity);
                    return (
                      <TableRow key={row._id} className="text-[#303030]">
                        <TableCell className="py-3 pr-0 pl-2">
                          <Checkbox
                            checked={selectedIds.includes(row._id)}
                            onCheckedChange={() => toggleSelectRow(row._id)}
                          />
                        </TableCell>
                        <TableCell className="truncate py-3 pr-2 pl-2 font-medium">
                          {row.promo_name}
                        </TableCell>
                        <TableCell className="px-2 py-3">{row.type}</TableCell>
                        <TableCell className="px-2 py-3">
                          {row.discount}%
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          {typeof stock === "object" ? (
                            <span className={stock.color}>{stock.label}</span>
                          ) : (
                            stock
                          )}
                        </TableCell>
                        <TableCell className="px-2 py-3">
                          <Badge
                            variant={
                              status.variant === "default"
                                ? "default"
                                : status.variant === "secondary"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              status.variant === "default"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                            }
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-2 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canManagePromo && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-7 w-7 rounded-full border border-[#eeeeee]"
                                onClick={() => handleEdit(row)}
                                aria-label={`Edit ${row.promo_name}`}
                              >
                                <PenLine className="h-4 w-4 text-blue-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-7 w-7 rounded-full border border-[#eeeeee]"
                              onClick={() => handleView(row)}
                              aria-label={`View ${row.promo_name}`}
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                            {canManagePromo && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-7 w-7 rounded-full border border-[#eeeeee]"
                                onClick={() => handleDeleteClick(row)}
                                aria-label={`Delete ${row.promo_name}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-16 text-center text-sm text-[#777]">
                No promo codes found. Click "Add Promo Code" to create one.
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-[#777]">
            <span>
              Showing {filteredCodes.length} of {promoCodes.length}
            </span>
          </div>
        </section>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent
          className="max-w-[760px] rounded-[20px] p-0"
          showCloseButton={false}
        >
          <PromoAddModal
            onClose={() => {
              setIsAddModalOpen(false);
              refetchPromoCodes();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="max-w-[620px] rounded-[20px] p-0"
          showCloseButton={false}
        >
          {editData && (
            <PromoEditModal
              data={editData}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditData(null);
                refetchPromoCodes();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent
          className="max-w-[700px] rounded-[20px]"
          showCloseButton={false}
        >
          {viewData && (
            <PromoViewModal
              data={viewData}
              onClose={() => {
                setIsViewModalOpen(false);
                setViewData(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => !open && setIsDeleteConfirmOpen(false)}
      >
        <DialogContent className="max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Delete Promo Code?</DialogTitle>
            <DialogDescription>
              This will soft-delete "<strong>{deleteName}</strong>". This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-red-500 hover:bg-red-600"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Modal */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent
          className="max-w-3xl rounded-[20px]"
          showCloseButton={false}
        >
          <PromoLogModal onClose={() => setIsLogModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
