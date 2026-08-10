import { useCallback, useState } from "react";
import { AlertCircle, ArrowUpDown, GitCommit, Github, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GitHubSyncPanel } from "./GitHubSyncPanel";
import { ContributionForm } from "./ContributionForm";
import { useContributions } from "../hooks/useContributions";
import type { Contribution } from "../types/contribution.types";

type SortField = "commitCount" | "name" | "githubUsername";
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

export const DeveloperContributions = ({
  hasDevAccess,
}: {
  hasDevAccess: boolean;
}) => {
  const {
    developerContributions,
    adminOptions,
    isLoading,
    isSyncing,
    syncStatus,
    error,
    handleSync,
    handleCreate,
    handleUpdate,
    searchStudentOptions,
  } = useContributions();

  const [sortField, setSortField] = useState<SortField>("commitCount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);

  const handleEdit = (contribution: Contribution) => {
    setEditingContribution(contribution);
    setFormOpen(true);
  };

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField]
  );

  const sortedAndFiltered = developerContributions
    .filter((c) => {
      const query = searchTerm.toLowerCase();
      return (
        c.idNumber.toLowerCase().includes(query) ||
        (c.name ?? "").toLowerCase().includes(query) ||
        (c.githubUsername ?? "").toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aVal: string | number = a.idNumber;
      let bVal: string | number = b.idNumber;

      if (sortField === "commitCount") {
        aVal = a.commitCount ?? 0;
        bVal = b.commitCount ?? 0;
      } else if (sortField === "name") {
        aVal = a.name || a.idNumber;
        bVal = b.name || b.idNumber;
      } else {
        aVal = a.githubUsername ?? "";
        bVal = b.githubUsername ?? "";
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
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
      {hasDevAccess && (
        <GitHubSyncPanel
          isSyncing={isSyncing}
          syncStatus={syncStatus}
          onSync={handleSync}
          hasDevAccess={hasDevAccess}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[260px]">
          <input
            type="text"
            placeholder="Search by ID or username..."
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
          <Plus className="mr-1 h-4 w-4" />
          Add Contribution
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e5e5e5] bg-white">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[30%] px-4 py-3 font-medium">
                <SortHeader field="name" onSort={handleSort}>
                  Name
                </SortHeader>
              </th>
              <th className="w-[30%] px-4 py-3 font-medium">
                <SortHeader field="githubUsername" onSort={handleSort}>
                  GitHub
                </SortHeader>
              </th>
              <th className="w-[20%] px-4 py-3 font-medium text-right">
                <SortHeader field="commitCount" onSort={handleSort}>
                  Commits
                </SortHeader>
              </th>
              <th className="w-[20%] px-4 py-3 font-medium">Repository</th>
              <th className="w-[6%] px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-b border-[#ededed]">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="mx-auto h-4 w-12 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20 rounded-full" />
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
                    {contribution.description ? (
                      <div
                        className="mt-0.5 max-w-[200px] truncate text-xs text-[#9a9a9a]"
                        title={contribution.description}
                      >
                        {contribution.description}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[#555]">
                      <Github className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {contribution.githubUsername || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1c9dde]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1c9dde]">
                      <GitCommit className="h-3 w-3" />
                      {contribution.commitCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#888]">
                    {syncStatus?.repository || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {contribution.description ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 rounded-full border border-[#eeeeee]"
                        onClick={() => handleEdit(contribution)}
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-sm text-[#777]">
                  <div className="flex flex-col items-center gap-2">
                    <Github className="h-8 w-8 text-[#ccc]" />
                    <p>No developer contributions yet</p>
                    <p className="text-xs text-[#aaa]">
                      {hasDevAccess
                        ? "Click Sync to fetch from GitHub"
                        : "Contact an admin to sync developer contributions"}
                    </p>
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
        type="developer"
        adminOptions={adminOptions}
        searchStudents={searchStudentOptions}
      />
    </div>
  );
};