import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Plus,
  Power,
  Search,
  ScrollText,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMembershipData } from "../hooks/useMembershipData";
import type { MembershipSort } from "../types/membership.types";

const TERM_OPTIONS = [
  { value: "MEMBERSHIP_TERM_FIRST", label: "1st Term" },
  { value: "MEMBERSHIP_TERM_SECOND", label: "2nd Term" },
];

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const MembershipView = () => {
  const {
    memberships,
    allMemberships,
    stats,
    isLoading,
    isMutating,
    error,
    search,
    statusFilter,
    termFilter,
    dateFrom,
    dateTo,
    setSearch,
    setStatusFilter,
    setTermFilter,
    setDateFrom,
    setDateTo,
    sort,
    toggleSort,
    page,
    totalPages,
    setPage,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isActivateDialogOpen,
    setIsActivateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedMembership,
    createFormData,
    setCreateFormData,
    editFormData,
    setEditFormData,
    openCreateDialog,
    openActivateDialog,
    openEditDialog,
    openDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleActivate,
    // History list
    histories,
    isHistoriesOpen,
    isHistoriesLoading,
    openHistories,
    closeHistories,
  } = useMembershipData();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const SortHeader = ({
    field,
    label,
  }: {
    field: MembershipSort["field"];
    label: string;
  }) => (
    <th
      className="h-12 cursor-pointer select-none px-4 text-left align-middle text-xs font-medium text-muted-foreground hover:bg-muted/50"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sort.field === field && (
          <span className="text-[#1C9DDE]">
            {sort.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-full flex-1 flex-col">
        <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="rounded-md border">
            <Skeleton className="h-12 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membership</h1>
          <p className="text-sm text-muted-foreground">
            Manage membership terms by period and dates. Only one membership is
            active at a time. Filter by name or period to pull terms avail in a
            time frame for reports.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Membership
          </Button>
        </div>
      </div>

      <div className="space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Memberships</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by membership name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground" htmlFor="filter-from">
            From
          </Label>
          <Input
            id="filter-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground" htmlFor="filter-to">
            To
          </Label>
          <Input
            id="filter-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear dates
          </Button>
        )}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as any)}
        >
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={termFilter}
          onValueChange={setTermFilter}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Terms</SelectItem>
            <SelectItem value="MEMBERSHIP_TERM_FIRST">1st Term</SelectItem>
            <SelectItem value="MEMBERSHIP_TERM_SECOND">2nd Term</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <SortHeader field="name" label="Membership Name" />
              <SortHeader field="startDate" label="Start Date" />
              <SortHeader field="endDate" label="End Date" />
              <th className="h-12 px-4 text-left text-xs font-medium text-muted-foreground">
                Term
              </th>
              <SortHeader field="status" label="Status" />
              <th className="h-12 px-4 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : memberships.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No memberships found.
                </td>
              </tr>
            ) : (
              memberships.map((m) => (
                <tr
                  key={m._id}
                  className="border-b last:border-none hover:bg-muted/50"
                >
                  <td className="px-4 py-3 align-middle font-medium">
                    {m.membership_name}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm">
                    {formatDate(m.start_date)}
                  </td>
                  <td className="px-4 py-3 align-middle text-sm">
                    {formatDate(m.end_date)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge variant="secondary">
                      {m.term_name === "MEMBERSHIP_TERM_FIRST"
                        ? "1st Term"
                        : "2nd Term"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {m.is_active ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <Clock3 className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openHistories(m)}
                        title="View activation history"
                      >
                        <ScrollText className="h-4 w-4" />
                      </Button>
                      {!m.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => openActivateDialog(m)}
                        >
                          <Power className="h-4 w-4" />
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(m)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => openDeleteDialog(m)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 10 + 1} to{" "}
            {Math.min(page * 10, allMemberships.length)} of{" "}
            {allMemberships.length} memberships
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => !open && setIsCreateDialogOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Membership</DialogTitle>
            <DialogDescription>
              Create a membership term (period + dates). Only one membership is
              active at a time — creating one deactivates the current active
              membership. Students request against it and their activation is
              recorded in history on approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="membership_name">Membership Name</Label>
              <Input
                id="membership_name"
                name="membership_name"
                value={createFormData.membership_name}
                onChange={handleChange}
                placeholder="e.g. 2026-2027 Academic Year Membership"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term_name">Term</Label>
              <Select
                value={createFormData.term_name}
                onValueChange={(v) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    term_name: v as any,
                  }))
                }
              >
                <SelectTrigger id="term_name">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TERM_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={createFormData.start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={createFormData.end_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isMutating ||
                !createFormData.membership_name ||
                !createFormData.start_date ||
                !createFormData.end_date
              }
            >
              {isMutating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog open={isActivateDialogOpen} onOpenChange={(open) => !open && setIsActivateDialogOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Power className="h-5 w-5" />
              Activate Membership
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to activate this membership term? Any
              other active term will be deactivated — only one membership is
              active at a time.
            </DialogDescription>
          </DialogHeader>
          {selectedMembership && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Membership:</span>
                <span className="font-medium">
                  {selectedMembership.membership_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term:</span>
                <span className="font-medium">
                  {selectedMembership.term_name === "MEMBERSHIP_TERM_FIRST"
                    ? "1st Term"
                    : "2nd Term"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActivateDialogOpen(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleActivate}
              disabled={isMutating}
            >
              {isMutating ? "Activating..." : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setIsEditDialogOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Membership</DialogTitle>
            <DialogDescription>
              Update membership term details. Changes will take effect
              immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_membership_name">Membership Name</Label>
              <Input
                id="edit_membership_name"
                name="membership_name"
                value={editFormData.membership_name}
                onChange={handleEditChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_date">Start Date</Label>
                <Input
                  id="edit_start_date"
                  name="start_date"
                  type="date"
                  value={editFormData.start_date}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_date">End Date</Label>
                <Input
                  id="edit_end_date"
                  name="end_date"
                  type="date"
                  value={editFormData.end_date}
                  onChange={handleEditChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_term_name">Term</Label>
              <Select
                value={editFormData.term_name}
                onValueChange={(v) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    term_name: v as any,
                  }))
                }
              >
                <SelectTrigger id="edit_term_name">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TERM_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isMutating}>
              {isMutating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Revoke Membership
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this membership term? Students
              activated under it will be set to NONE. Activation history
              records are preserved.
            </DialogDescription>
          </DialogHeader>
          {selectedMembership && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Membership:</span>
                <span className="font-medium">
                  {selectedMembership.membership_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term:</span>
                <span className="font-medium">
                  {selectedMembership.term_name === "MEMBERSHIP_TERM_FIRST"
                    ? "1st Term"
                    : "2nd Term"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isMutating}
            >
              {isMutating ? "Revoking..." : "Revoke Membership"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History List Dialog */}
      <Dialog open={isHistoriesOpen} onOpenChange={(open) => !open && closeHistories()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Activation History
            </DialogTitle>
            <DialogDescription>
              Students activated under this membership term. Read-only.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-3">
            {isHistoriesLoading ? (
              <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : histories.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">
                No activation records for this membership.
              </p>
            ) : (
              histories.map((h) => (
                <div key={h._id} className="space-y-1 rounded-lg border p-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">{h.name || "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      {h.reference_code || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                    <span>ID: {h.id_number || "—"}</span>
                    <span>{formatDate(h.date)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                    <span>{h.type || "—"}</span>
                    <span>{h.admin || "—"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeHistories}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
