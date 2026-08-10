import { useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  HandHeart,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ContributionForm } from "./ContributionForm";
import { useContributions } from "../hooks/useContributions";
import type { Contribution } from "../types/contribution.types";

type SortField = "date" | "idNumber" | "description";
type SortDirection = "asc" | "desc";

const SortHeader = ({
  field,
  children,
  onSort,
  className,
}: {
  field: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={() => onSort(field)}
    className={cn("flex items-center gap-1 text-left", className)}
  >
    {children}
    <ArrowUpDown className="h-3 w-3 text-[#737373]" />
  </button>
);

export const VolunteerContributions = () => {
  const {
    volunteerContributions,
    adminOptions,
    isLoading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
    searchStudentOptions,
  } = useContributions();

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d: SortDirection) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEdit = (contribution: Contribution) => {
    setEditingContribution(contribution);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const success = await handleDelete(deleteConfirm);
    if (success) setDeleteConfirm(null);
  };

  const sortedAndFiltered = volunteerContributions
    .filter((c) => {
      const query = searchTerm.toLowerCase();
      return (
        c.idNumber.toLowerCase().includes(query) ||
        (c.name ?? "").toLowerCase().includes(query) ||
        (c.description ?? "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aVal: string | number = a.idNumber;
      let bVal: string | number = b.idNumber;

      if (sortField === "idNumber") {
        aVal = a.name || a.idNumber;
        bVal = b.name || b.idNumber;
      }
      if (sortField === "date") {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        return sortDirection === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
      if (sortField === "description") {
        aVal = a.description ?? "";
        bVal = b.description ?? "";
      }
      const result = String(aVal).localeCompare(String(bVal));
      return sortDirection === "asc" ? result : -result;
    });

  if (error) {
    return (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[260px]">
          <input
            type="text"
            placeholder="Search contributions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 rounded-full border border-[#e8e8e8] bg-white px-4 pl-9 text-sm outline-none focus:border-[#1c9dde]"
          />
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Button
          type="button"
          className="h-9 rounded-full bg-[#1c9dde] px-5 hover:bg-[#168bc7]"
          onClick={() => {
            setEditingContribution(null);
            setFormOpen(true);
          }}
        >
          Add Contribution
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e5e5e5] bg-white">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[25%] px-4 py-3 font-medium">
                <SortHeader field="idNumber" onSort={handleSort}>
                  Member
                </SortHeader>
              </th>
              <th className="w-[50%] px-4 py-3 font-medium">
                <SortHeader field="description" onSort={handleSort}>
                  Description
                </SortHeader>
              </th>
              <th className="w-[15%] px-4 py-3 font-medium text-center">
                <SortHeader field="date" onSort={handleSort}>
                  Date
                </SortHeader>
              </th>
              <th className="w-[10%] rounded-r-md px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-b border-[#ededed]">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-full rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Skeleton className="mx-auto h-4 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="mx-auto h-7 w-7 rounded-full" />
                  </td>
                </tr>
              ))
            ) : sortedAndFiltered.length > 0 ? (
              sortedAndFiltered.map((contribution) => (
                <tr
                  key={contribution._id}
                  className="border-b border-[#ededed] text-[#303030]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {contribution.name || "—"}
                    </div>
                    <div className="text-xs text-[#888]">
                      {contribution.idNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {contribution.description}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-[#888]">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(contribution.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 rounded-full border border-[#eeeeee]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEdit(contribution)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(contribution._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center text-sm text-[#777]">
                  <div className="flex flex-col items-center gap-2">
                    <HandHeart className="h-8 w-8 text-[#ccc]" />
                    <p>No volunteer contributions found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ContributionForm
        contribution={editingContribution}
        isSubmitting={false}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        onUpdate={handleUpdate}
        type="volunteer"
        adminOptions={adminOptions}
        searchStudents={searchStudentOptions}
      />

      <Dialog
        open={Boolean(deleteConfirm)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Delete Contribution?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#777]">This action cannot be undone.</p>
          <DialogFooter className="mt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-full bg-red-500 hover:bg-red-600"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};