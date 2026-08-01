import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Ban,
  Check,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  UserPen,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useRecruitmentData,
  ROWS_PER_PAGE,
  DEFAULT_FILTERS,
} from "../hooks/useRecruitmentData";
import type {
  RecruitmentApplicant,
  RecruitmentFilters,
  RecruitmentPosition,
  RecruitmentSort,
  RecruitmentSortField,
} from "../types/Recruitment.types";
import { ApplicantInfoModal } from "./ApplicantInfoModal";
import { InterviewSchedulingModal } from "./InterviewSchedulingModal";
import OpenRole from "./OpenRole";
import PositionEditModal from "./PositionEditModal";
import { VerificationModal } from "./VerificationModal";
import { AccountVerifiedModal } from "./AccountVerifiedModal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const courses = ["BSIT", "BSCS", "ACT"];
const years = ["1", "2", "3", "4"];

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "For Verification": "bg-slate-100 text-slate-700",
  Scheduled: "bg-blue-100 text-blue-700",
  "Interview Completed": "bg-purple-100 text-purple-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const POSITION_STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  OPEN: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-red-100 text-red-700",
};

const AVATAR_COLORS = [
  "bg-orange-400",
  "bg-blue-400",
  "bg-purple-400",
  "bg-teal-400",
  "bg-pink-400",
];

function getAvatarColor(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

interface RecruitmentFilterPopoverProps {
  filters: RecruitmentFilters;
  roleOptions: string[];
  onApply: (filters: RecruitmentFilters) => void;
}

interface SortableHeaderProps {
  label: string;
  field: RecruitmentSortField;
  className?: string;
  sort: RecruitmentSort;
  onSort: (field: RecruitmentSortField) => void;
}

const SortableHeader = ({
  label,
  field,
  className,
  sort,
  onSort,
}: SortableHeaderProps) => (
  <button
    type="button"
    onClick={() => onSort(field)}
    className={cn(
      "flex cursor-pointer items-center gap-1 font-medium",
      className
    )}
  >
    {label}
    <ArrowUpDown
      className={cn(
        "h-3.5 w-3.5",
        sort.field === field ? "text-[#1c9dde]" : "text-slate-400"
      )}
    />
  </button>
);

const RecruitmentFilterPopover = ({
  filters,
  roleOptions,
  onApply,
}: RecruitmentFilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  const hasActiveFilters =
    filters.roles.length > 0 ||
    filters.courses.length > 0 ||
    filters.years.length > 0 ||
    filters.status !== "all";

  const updateSingle = (field: "roles" | "courses" | "years", value: string) =>
    setDraft((current) => ({
      ...current,
      [field]: value ? [value] : [],
    }));

  const handleCancel = () => {
    setDraft(filters);
    setIsOpen(false);
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const clearAppliedFilters = () => {
    setDraft(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          if (open) setDraft(filters);
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-full border-[#e8e8e8] bg-white px-3 hover:bg-white sm:px-4"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={24}
          className="w-80 rounded-2xl p-5 shadow-xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-medium">Filter</h2>
            <button
              type="button"
              className="cursor-pointer text-xs text-red-500"
              onClick={() => setDraft(DEFAULT_FILTERS)}
            >
              Reset Filter
            </button>
          </div>
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Role</Label>
              <Select
                value={draft.roles[0] ?? ""}
                onValueChange={(v) => updateSingle("roles", v)}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-[#ececec]">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Course</Label>
              <Select
                value={draft.courses[0] ?? ""}
                onValueChange={(v) => updateSingle("courses", v)}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-[#ececec]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">
                Year Level
              </Label>
              <Select
                value={draft.years[0] ?? ""}
                onValueChange={(v) => updateSingle("years", v)}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-[#ececec]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-4"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 rounded-full bg-[#1c9dde] px-5 hover:bg-[#168bc7]"
              onClick={handleApply}
            >
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Clear filters"
          title="Clear filters"
          className="h-9 w-9 rounded-full border-[#e8e8e8] bg-white text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={clearAppliedFilters}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4 text-left">
    <span className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
      {label}
    </span>
    <p className="mt-1 text-2xl font-semibold text-[#2b2b2b]">{value}</p>
  </div>
);

export const RecuitmentViews = () => {
  const {
    activeTab,
    setActiveTab,
    applicants,
    pagedApplicants,
    filteredApplicants,
    selectedIds,
    toggleApplicantSelection,
    clearSelection,
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    roleOptions,
    toggleSort,
    currentPage,
    totalPages,
    setPage,
    isLoading,
    isMutating,
    error,
    mutationError,
    clearMutationError,
    approveApplicant,
    rejectApplicant,
    refetch,
    selectedApplicant,
    isDetailsLoading,
    detailsError,
    viewApplicantDetails,
    closeApplicantDetails,
    viewResume,
    scheduleInterview,
    downloadResume,
    isResumeLoading,
    resumeError,
    openRoleApplication,
    positions,
    isPositionsLoading,
    positionsError,
    updatePosition,
    closePosition,
    deletePosition,
    verificationApplicants,
    verifyApplicant,
    verifiedAccount,
    clearVerifiedAccount,
    rejectedApplicants,
    deleteRejectedApplicant,
    clearAllRejectedApplicants,
  } = useRecruitmentData();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openPositionMenuId, setOpenPositionMenuId] = useState<string | null>(
    null
  );
  const [editingPosition, setEditingPosition] =
    useState<RecruitmentPosition | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isOpenRoleOpen, setIsOpenRoleOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RecruitmentApplicant | null>(
    null
  );
  const [positionDeleteTarget, setPositionDeleteTarget] =
    useState<RecruitmentPosition | null>(null);
  const [isClearAllRejectedOpen, setIsClearAllRejectedOpen] = useState(false);

  const counts = useMemo(() => {
    return {
      pending: applicants.filter((a) => a.status === "Pending").length,
      approved: applicants.filter((a) => a.status === "Approved").length,
      verifications: verificationApplicants.length,
    };
  }, [applicants, verificationApplicants]);

  const total = filteredApplicants.length;

  const allOnPageSelected =
    pagedApplicants.length > 0 &&
    pagedApplicants.every((a) => selectedIds.includes(a.id));

  const toggleSelectAllOnPage = () => {
    pagedApplicants.forEach((a) => {
      const isSelected = selectedIds.includes(a.id);
      if (allOnPageSelected && isSelected) toggleApplicantSelection(a.id);
      if (!allOnPageSelected && !isSelected) toggleApplicantSelection(a.id);
    });
  };

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#333] [&_button:disabled]:cursor-not-allowed [&_button:not(:disabled)]:cursor-pointer">
      <header className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage applicants and their details
          </p>
        </div>

        <Button
          type="button"
          className="h-10 shrink-0 rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
          onClick={() => setIsOpenRoleOpen(true)}
        >
          <Plus className="h-4 w-1" />
          Open Role Application
        </Button>
      </header>
      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        {/* Stat cards */}
        {isLoading ? (
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
          </div>
        ) : (
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Pending" value={counts.pending} />
            <StatCard label="Approved" value={counts.approved} />
            <StatCard label="Verifications" value={counts.verifications} />
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>
              Unable to load applicant data{error ? `: ${error}` : "."}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 border-red-300 bg-white text-red-700 hover:bg-red-100"
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Action failures (reject/approve/etc) surface here without hiding
              already-loaded data, unlike the load-error banner above. */}
        {mutationError && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>{mutationError}</span>
            <button
              type="button"
              onClick={clearMutationError}
              className="cursor-pointer rounded-md p-1 hover:bg-amber-100"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="rounded-[22px] border border-[#e5e5e5] bg-white px-4 py-5 sm:px-6">
          {/* Row 1: pill tabs + search */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full bg-[#f2f2f2] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("applicants")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  activeTab === "applicants"
                    ? "bg-white text-[#303030] shadow-sm"
                    : "text-[#777] hover:text-[#303030]"
                }`}
              >
                Applicants
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("applications")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  activeTab === "applications"
                    ? "bg-white text-[#303030] shadow-sm"
                    : "text-[#777] hover:text-[#303030]"
                }`}
              >
                Open Roles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("verification")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  activeTab === "verification"
                    ? "bg-white text-[#303030] shadow-sm"
                    : "text-[#777] hover:text-[#303030]"
                }`}
              >
                Verifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rejected")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  activeTab === "rejected"
                    ? "bg-white text-[#303030] shadow-sm"
                    : "text-[#777] hover:text-[#303030]"
                }`}
              >
                Rejected
                {rejectedApplicants.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                    {rejectedApplicants.length}
                  </span>
                )}
              </button>
            </div>

            <div className="relative w-56">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="rounded-full border-[#e0e0e0] pl-9"
              />
            </div>
          </div>

          {/* Row 2: filter dropdowns */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Select
              value={filters.roles[0] ?? "all"}
              onValueChange={(v) =>
                setFilters((current) => ({
                  ...current,
                  roles: v === "all" ? [] : [v],
                }))
              }
            >
              <SelectTrigger className="h-9 w-[140px] rounded-full border-[#e8e8e8] text-sm">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters((current) => ({
                  ...current,
                  status: v as RecruitmentFilters["status"],
                }))
              }
            >
              <SelectTrigger className="h-9 w-[150px] rounded-full border-[#e8e8e8] text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="For Verification">
                  For Verification
                </SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Interview Completed">
                  Interview Completed
                </SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <RecruitmentFilterPopover
              filters={filters}
              roleOptions={roleOptions}
              onApply={setFilters}
            />
          </div>

          {/* Table / Verification cards */}
          {activeTab === "applications" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] table-fixed border-collapse text-sm">
                <thead>
                  <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                    <th className="w-[26%] rounded-l-md px-3 py-2 text-left font-medium">
                      Position
                    </th>
                    <th className="w-[13%] px-3 py-2 text-left font-medium">
                      Status
                    </th>
                    <th className="w-[12%] px-3 py-2 text-left font-medium">
                      Slots
                    </th>
                    <th className="w-[17%] px-3 py-2 text-left font-medium">
                      Deadline
                    </th>
                    <th className="w-[17%] px-3 py-2 text-left font-medium">
                      Created
                    </th>
                    <th className="w-[15%] rounded-r-md px-3 py-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isPositionsLoading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index} className="border-b border-[#ededed]">
                        {Array.from({ length: 6 }, (_, cell) => (
                          <td key={cell} className="px-3 py-3">
                            <Skeleton className="h-4 w-full rounded-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : positionsError ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-16 text-center text-sm text-red-600"
                      >
                        {positionsError}
                      </td>
                    </tr>
                  ) : positions.length > 0 ? (
                    positions.map((position) => (
                      <tr
                        key={position._id}
                        className="border-b border-[#ededed] text-[#303030] hover:bg-slate-50"
                      >
                        <td className="truncate px-3 py-3 font-medium text-slate-900">
                          {position.title}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              POSITION_STATUS_STYLES[position.hiringStatus] ??
                                "bg-slate-100 text-slate-600"
                            )}
                          >
                            {position.hiringStatus}
                          </span>
                        </td>
                        <td className="px-3 py-3">{position.slots ?? "—"}</td>
                        <td className="px-3 py-3">
                          {position.applicationDeadline
                            ? new Date(
                                position.applicationDeadline
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-3">
                          {new Date(position.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Popover
                            open={openPositionMenuId === position._id}
                            onOpenChange={(open) =>
                              setOpenPositionMenuId(open ? position._id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                disabled={isMutating}
                                className="h-7 w-7 rounded-full border text-slate-500 hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              className="w-56 rounded-xl border-[#ececec] p-1.5 shadow-lg"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPosition(position);
                                  setOpenPositionMenuId(null);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4 text-slate-500" />
                                Edit Role Application
                              </button>
                              <button
                                type="button"
                                disabled={position.hiringStatus === "CLOSED"}
                                onClick={() => {
                                  closePosition(position._id);
                                  setOpenPositionMenuId(null);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                              >
                                <Ban className="h-4 w-4" />
                                Close Role Application
                              </button>
                              {position.hiringStatus === "CLOSED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPositionDeleteTarget(position);
                                    setOpenPositionMenuId(null);
                                  }}
                                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Role Application
                                </button>
                              )}
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-16 text-center text-sm text-[#777]"
                      >
                        No open roles yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "applicants" ? (
            <div className="overflow-x-auto">
              {selectedIds.length > 0 && (
                <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span>{selectedIds.length} selected</span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="cursor-pointer font-medium text-[#1c9dde] hover:underline"
                  >
                    Clear selection
                  </button>
                </div>
              )}
              <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
                <thead>
                  <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                    <th className="w-[4%] rounded-l-md px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAllOnPage}
                        aria-label="Select all on page"
                        className="h-4 w-4 cursor-pointer"
                      />
                    </th>
                    <th className="w-[24%] px-3 py-2 text-left">
                      <SortableHeader
                        label="Applicant"
                        field="name"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </th>
                    <th className="w-[14%] px-3 py-2 text-left font-medium">
                      ID Number
                    </th>
                    <th className="w-[14%] px-3 py-2 text-left">
                      <SortableHeader
                        label="Course / Year"
                        field="courseYear"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </th>
                    <th className="w-[16%] px-3 py-2 text-left">
                      <SortableHeader
                        label="Role Applied"
                        field="roleApplied"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </th>
                    <th className="w-[14%] px-3 py-2 text-left">
                      <SortableHeader
                        label="Status"
                        field="status"
                        sort={sort}
                        onSort={toggleSort}
                      />
                    </th>
                    <th className="w-[14%] rounded-r-md px-3 py-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index} className="border-b border-[#ededed]">
                        {Array.from({ length: 7 }, (_, cell) => (
                          <td key={cell} className="px-3 py-3">
                            <Skeleton className="h-4 w-full rounded-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : pagedApplicants.length > 0 ? (
                    pagedApplicants.map((applicant) => (
                      <tr
                        key={applicant.id}
                        className="border-b border-[#ededed] text-[#303030] hover:bg-slate-50"
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(applicant.id)}
                            onChange={() =>
                              toggleApplicantSelection(applicant.id)
                            }
                            aria-label={`Select ${applicant.name}`}
                            className="h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                                getAvatarColor(applicant.name || "?")
                              )}
                            >
                              {getInitial(applicant.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {applicant.name || "—"}
                              </p>
                              <p className="truncate text-xs text-[#8a8a8a]">
                                {applicant.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="truncate px-3 py-3">
                          {applicant.id_number || "—"}
                        </td>
                        <td className="truncate px-3 py-3">
                          {[applicant.course, applicant.year]
                            .filter(Boolean)
                            .join(" • ") || "—"}
                        </td>
                        <td className="truncate px-3 py-3">
                          {applicant.roleApplied || "—"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              STATUS_STYLES[applicant.status] ??
                                "bg-slate-100 text-slate-600"
                            )}
                          >
                            {applicant.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <Popover
                            open={openMenuId === applicant.id}
                            onOpenChange={(open) =>
                              setOpenMenuId(open ? applicant.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                disabled={isMutating}
                                className="h-7 w-7 rounded-full border text-slate-500 hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              className="w-52 rounded-xl border-[#ececec] p-1.5 shadow-lg"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  viewApplicantDetails(applicant.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
                              >
                                <UserPen className="h-4 w-4 text-slate-500" />
                                View Details
                              </button>
                              <button
                                type="button"
                                disabled={
                                  applicant.status === "Approved" ||
                                  applicant.status === "Rejected"
                                }
                                onClick={() => {
                                  approveApplicant(applicant.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-emerald-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={
                                  applicant.status === "Approved" ||
                                  applicant.status === "Rejected"
                                }
                                onClick={() => {
                                  rejectApplicant(applicant.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </button>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-16 text-center text-sm text-[#777]"
                      >
                        No applicants found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "rejected" ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-medium text-slate-700">
                  Rejected Applicants
                </h2>
                {rejectedApplicants.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isMutating}
                    onClick={() => setIsClearAllRejectedOpen(true)}
                    className="h-8 rounded-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Clear All
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : rejectedApplicants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] table-fixed border-collapse text-sm">
                    <thead>
                      <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                        <th className="w-[30%] rounded-l-md px-3 py-2 text-left font-medium">
                          Applicant
                        </th>
                        <th className="w-[15%] px-3 py-2 text-left font-medium">
                          ID Number
                        </th>
                        <th className="w-[15%] px-3 py-2 text-left font-medium">
                          Course / Year
                        </th>
                        <th className="w-[25%] px-3 py-2 text-left font-medium">
                          Role Applied
                        </th>
                        <th className="w-[15%] rounded-r-md px-3 py-2 text-right font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedApplicants.map((applicant) => (
                        <tr
                          key={applicant.id}
                          className="border-b border-[#ededed] text-[#303030] hover:bg-slate-50"
                        >
                          <td className="px-3 py-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                                  getAvatarColor(applicant.name || "?")
                                )}
                              >
                                {getInitial(applicant.name)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">
                                  {applicant.name || "—"}
                                </p>
                                <p className="truncate text-xs text-[#8a8a8a]">
                                  {applicant.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="truncate px-3 py-3">
                            {applicant.id_number || "—"}
                          </td>
                          <td className="truncate px-3 py-3">
                            {[applicant.course, applicant.year]
                              .filter(Boolean)
                              .join(" • ") || "—"}
                          </td>
                          <td className="truncate px-3 py-3">
                            {applicant.roleApplied || "—"}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              disabled={isMutating}
                              onClick={() => setDeleteTarget(applicant)}
                              className="h-7 w-7 rounded-full border text-red-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${applicant.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-16 text-center text-sm text-[#777]">
                  No rejected applicants.
                </p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="mb-4 text-center text-base font-medium text-slate-700">
                Verification Required
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-56 rounded-2xl" />
                  ))}
                </div>
              ) : verificationApplicants.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {verificationApplicants.map((applicant) => (
                    <VerificationModal
                      key={applicant.id}
                      applicant={applicant}
                      isApproving={isMutating}
                      onApprove={verifyApplicant}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-16 text-center text-sm text-[#777]">
                  No applicants awaiting verification.
                </p>
              )}
            </div>
          )}

          {/* Pagination (applicants tab only — the positions and
              verification tabs aren't paginated with these controls) */}
          {activeTab === "applicants" && (
            <div className="mt-7 flex flex-col items-center justify-between gap-3 text-xs text-[#8a8a8a] sm:flex-row">
              <span>
                Showing {total > 0 ? (currentPage - 1) * ROWS_PER_PAGE + 1 : 0}{" "}
                to {Math.min(currentPage * ROWS_PER_PAGE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:text-[#c9c9c9]"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-7 min-w-7 cursor-pointer rounded-full px-2",
                        p === currentPage
                          ? "bg-[#1c9dde] text-white"
                          : "border border-[#eeeeee] bg-white text-[#696969]"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:text-[#c9c9c9]"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <ApplicantInfoModal
        applicant={selectedApplicant}
        open={!!selectedApplicant || isDetailsLoading}
        isLoading={isDetailsLoading}
        error={detailsError}
        onClose={closeApplicantDetails}
        onSetSchedule={() => setIsScheduleOpen(true)}
        onViewResume={viewResume}
        onDownloadResume={downloadResume}
        isResumeLoading={isResumeLoading}
        resumeError={resumeError}
      />

      <InterviewSchedulingModal
        open={isScheduleOpen}
        isSubmitting={isMutating}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={async (values) => {
          if (!selectedApplicant) return;
          await scheduleInterview(selectedApplicant.id, values);
          setIsScheduleOpen(false);
        }}
      />
      <OpenRole
        open={isOpenRoleOpen}
        isSubmitting={isMutating}
        onClose={() => setIsOpenRoleOpen(false)}
        onConfirm={async (data) => {
          try {
            await openRoleApplication(data);
            setIsOpenRoleOpen(false);
          } catch {
            // mutationError is already set by the hook
          }
        }}
      />
      <PositionEditModal
        open={!!editingPosition}
        isSubmitting={isMutating}
        position={editingPosition}
        onClose={() => setEditingPosition(null)}
        onConfirm={async (data) => {
          if (!editingPosition) return;
          try {
            await updatePosition(editingPosition._id, data);
            setEditingPosition(null);
          } catch {
            // mutationError is already set by the hook
          }
        }}
      />
      <AccountVerifiedModal
        result={verifiedAccount}
        onClose={clearVerifiedAccount}
      />

      {/* Delete single rejected applicant — confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Delete this applicant?
            </DialogTitle>
            <p className="text-sm text-slate-500">
              This will permanently remove{" "}
              <span className="font-medium text-slate-700">
                {deleteTarget?.name}
              </span>
              's rejected application. This action cannot be undone.
            </p>
            <div className="mt-2 flex w-full justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-full"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-9 flex-1 rounded-full bg-red-500 hover:bg-red-600"
                disabled={isMutating}
                onClick={async () => {
                  if (!deleteTarget) return;
                  await deleteRejectedApplicant(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                {isMutating ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear all rejected applicants — confirmation */}
      <Dialog
        open={isClearAllRejectedOpen}
        onOpenChange={setIsClearAllRejectedOpen}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Clear all rejected applicants?
            </DialogTitle>
            <p className="text-sm text-slate-500">
              This will permanently delete{" "}
              <span className="font-medium text-slate-700">
                {rejectedApplicants.length}
              </span>{" "}
              rejected application
              {rejectedApplicants.length === 1 ? "" : "s"}. This action cannot
              be undone.
            </p>
            <div className="mt-2 flex w-full justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-full"
                onClick={() => setIsClearAllRejectedOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-9 flex-1 rounded-full bg-red-500 hover:bg-red-600"
                disabled={isMutating}
                onClick={async () => {
                  await clearAllRejectedApplicants();
                  setIsClearAllRejectedOpen(false);
                }}
              >
                {isMutating ? "Deleting..." : "Delete All"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete a closed position — confirmation */}
      <Dialog
        open={!!positionDeleteTarget}
        onOpenChange={(open) => !open && setPositionDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Delete this role application?
            </DialogTitle>
            <p className="text-sm text-slate-500">
              This will permanently remove{" "}
              <span className="font-medium text-slate-700">
                {positionDeleteTarget?.title}
              </span>
              . This action cannot be undone.
            </p>
            <div className="mt-2 flex w-full justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 rounded-full"
                onClick={() => setPositionDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-9 flex-1 rounded-full bg-red-500 hover:bg-red-600"
                disabled={isMutating}
                onClick={async () => {
                  if (!positionDeleteTarget) return;
                  await deletePosition(positionDeleteTarget._id);
                  setPositionDeleteTarget(null);
                }}
              >
                {isMutating ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecuitmentViews;
