import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  IdCard,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
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
  RecruitmentFilters,
  RecruitmentStatus,
} from "../types/Recruitment.types";
import { ApplicantInfoDialog } from "./ApplicantInfo";
import { InterviewSchedulingDialog } from "./InterviewSchedulingDialog";

const courses = ["BSIT", "BSCS", "ACT"];
const years = ["1", "2", "3", "4"];

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "For Verification": "bg-slate-100 text-slate-700",
  "Interview Scheduled": "bg-blue-100 text-blue-700",
  "Interview Completed": "bg-purple-100 text-purple-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
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

const StatCard = ({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "cursor-pointer rounded-2xl border bg-white px-5 py-4 text-left transition-colors",
      active
        ? "border-[#1c9dde] ring-1 ring-[#1c9dde]"
        : "border-[#e5e5e5] hover:border-[#c9c9c9]"
    )}
  >
    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
      {label}
    </span>
    <p className="mt-1 text-2xl font-semibold text-[#2b2b2b]">{value}</p>
  </button>
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
    search,
    setSearch,
    filters,
    setFilters,
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
    scheduleInterview,
  } = useRecruitmentData();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const counts = useMemo(() => {
    return {
      pending: applicants.filter((a) => a.status === "Pending").length,
      approved: applicants.filter((a) => a.status === "Approved").length,
      verifications: applicants.filter((a) => a.status === "For Verification")
        .length,
    };
  }, [applicants]);

  const activeStatusCard =
    filters.status === "Pending"
      ? "pending"
      : filters.status === "Approved"
        ? "approved"
        : filters.status === "For Verification"
          ? "verifications"
          : null;

  const toggleStatusCard = (
    card: "pending" | "approved" | "verifications",
    status: RecruitmentStatus
  ) => {
    setFilters((current) => ({
      ...current,
      status: activeStatusCard === card ? "all" : status,
    }));
  };

  const total = filteredApplicants.length;

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#333] [&_button:disabled]:cursor-not-allowed [&_button:not(:disabled)]:cursor-pointer">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Applications</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage applicants and their details
        </p>
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
            <StatCard
              label="Pending"
              value={counts.pending}
              active={activeStatusCard === "pending"}
              onClick={() => toggleStatusCard("pending", "Pending")}
            />
            <StatCard
              label="Approved"
              value={counts.approved}
              active={activeStatusCard === "approved"}
              onClick={() => toggleStatusCard("approved", "Approved")}
            />
            <StatCard
              label="Verifications"
              value={counts.verifications}
              active={activeStatusCard === "verifications"}
              onClick={() =>
                toggleStatusCard("verifications", "For Verification")
              }
            />
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
          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-2 sm:justify-between sm:gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-[260px]">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-9 rounded-full border-[#e8e8e8] pl-9 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("applications")}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-sm",
                  activeTab === "applications"
                    ? "bg-[#1c9dde] text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                Open Roles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("verification")}
                className={cn(
                  "cursor-pointer rounded-full px-3 py-1.5 text-sm",
                  activeTab === "verification"
                    ? "bg-[#1c9dde] text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                Verifications
              </button>

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
                  <SelectItem value="Interview Scheduled">
                    Interview Scheduled
                  </SelectItem>
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                  <th className="w-[4%] rounded-l-md px-3 py-2 text-left font-medium">
                    <input
                      type="checkbox"
                      checked={
                        pagedApplicants.length > 0 &&
                        pagedApplicants.every((a) => selectedIds.includes(a.id))
                      }
                      onChange={() => {
                        pagedApplicants.forEach((a) =>
                          toggleApplicantSelection(a.id)
                        );
                      }}
                    />
                  </th>
                  <th className="w-[22%] px-3 py-2 text-left font-medium">
                    Name
                  </th>
                  <th
                    className="w-[13%] cursor-pointer px-3 py-2 text-left font-medium select-none"
                    onClick={() => toggleSort("id_number")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Student ID <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="w-[15%] cursor-pointer px-3 py-2 text-left font-medium select-none"
                    onClick={() => toggleSort("courseYear")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Course &amp; Year <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="w-[14%] px-3 py-2 text-left font-medium">
                    Role Applied
                  </th>
                  <th
                    className="w-[15%] cursor-pointer px-3 py-2 text-left font-medium select-none"
                    onClick={() => toggleSort("status")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Status <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="w-[8%] px-3 py-2" />
                  <th className="w-[9%] rounded-r-md px-3 py-2 text-right font-medium">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: ROWS_PER_PAGE }, (_, index) => (
                    <tr key={index} className="border-b border-[#ededed]">
                      {Array.from({ length: 8 }, (_, cell) => (
                        <td key={cell} className="px-3 py-3">
                          <Skeleton className="h-4 w-full rounded-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? null : pagedApplicants.length > 0 ? (
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
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                              getAvatarColor(applicant.name)
                            )}
                          >
                            {getInitial(applicant.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-slate-900">
                              {applicant.name}
                            </div>
                            <div className="truncate text-xs text-slate-500">
                              {applicant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">{applicant.id_number}</td>
                      <td className="px-3 py-3">
                        {applicant.course} - {applicant.year}
                      </td>
                      <td className="truncate px-3 py-3">
                        {applicant.roleApplied}
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
                      <td className="px-3 py-3">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          title="View applicant"
                          className="h-7 w-7 rounded-full text-slate-500 hover:bg-slate-100"
                          onClick={() => viewApplicantDetails(applicant.id)}
                        >
                          <IdCard className="h-4 w-4" />
                        </Button>
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
                              className="h-7 w-7 rounded-full text-slate-500 hover:bg-slate-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="w-44 rounded-xl border-[#ececec] p-1 shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                approveApplicant(applicant.id);
                                setOpenMenuId(null);
                              }}
                              className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
                            >
                              Approve Application
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                rejectApplicant(applicant.id);
                                setOpenMenuId(null);
                              }}
                              className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                            >
                              Reject Application
                            </button>
                          </PopoverContent>
                        </Popover>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-16 text-center text-sm text-[#777]"
                    >
                      No applicants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-7 flex flex-col items-center justify-between gap-3 text-xs text-[#8a8a8a] sm:flex-row">
            <span>
              Showing {total > 0 ? (currentPage - 1) * ROWS_PER_PAGE + 1 : 0} to{" "}
              {Math.min(currentPage * ROWS_PER_PAGE, total)} of {total}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
              ))}
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
        </section>
      </div>

      <ApplicantInfoDialog
        applicant={selectedApplicant}
        open={!!selectedApplicant || isDetailsLoading}
        isLoading={isDetailsLoading}
        error={detailsError}
        onClose={closeApplicantDetails}
        onSetSchedule={() => setIsScheduleOpen(true)}
      />

      <InterviewSchedulingDialog
        open={isScheduleOpen}
        isSubmitting={isMutating}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={async (values) => {
          if (!selectedApplicant) return;
          await scheduleInterview(selectedApplicant.id, values);
          setIsScheduleOpen(false);
        }}
      />
    </div>
  );
};

export default RecuitmentViews;
