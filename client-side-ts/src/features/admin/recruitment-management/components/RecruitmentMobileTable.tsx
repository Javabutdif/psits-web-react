import { useState } from "react";
import {
  Ban,
  Check,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  RecruitmentApplicant,
  RecruitmentPosition,
} from "../types/Recruitment.types";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "For Verification": "bg-slate-100 text-slate-700",
  Scheduled: "bg-blue-100 text-blue-700",
  "Interviewed": "bg-purple-100 text-purple-700",
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
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/* ------------------------------------------------------------------ */
/* ApplicantMobileCard — "Applicants" tab                              */
/* ------------------------------------------------------------------ */

interface ApplicantMobileCardProps {
  applicant: RecruitmentApplicant;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetails: (id: string) => void;
  canManage?: boolean;
  isMutating?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const ApplicantMobileCard = ({
  applicant,
  selected,
  onToggleSelect,
  onViewDetails,
  canManage = false,
  isMutating = false,
  onApprove,
  onReject,
}: ApplicantMobileCardProps) => {
  const isFinal =
    applicant.status === "Approved" || applicant.status === "Rejected";

  return (
    <div className="space-y-3 rounded-xl border border-[#ececec] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(applicant.id)}
            className="mt-1 data-[state=checked]:border-[#1C9DDE] data-[state=checked]:bg-[#1C9DDE]"
          />
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
            <p className="text-muted-foreground truncate text-xs">
              {applicant.email}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            STATUS_STYLES[applicant.status] ?? "bg-slate-100 text-slate-600"
          )}
        >
          {applicant.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">ID Number</p>
          <p className="font-medium">{applicant.id_number || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Course / Year</p>
          <p className="font-medium">
            {[applicant.course, applicant.year].filter(Boolean).join(" • ") ||
              "—"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs">Role Applied</p>
          <p className="font-medium">{applicant.roleApplied || "—"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 flex-1 rounded-full"
          onClick={() => onViewDetails(applicant.id)}
        >
          View Details
        </Button>
        {canManage && (
          <>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              disabled={isMutating || isFinal}
              onClick={() => onApprove?.(applicant.id)}
              aria-label="Approve"
              className="h-8 w-8 shrink-0 rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              disabled={isMutating || isFinal}
              onClick={() => onReject?.(applicant.id)}
              aria-label="Reject"
              className="h-8 w-8 shrink-0 rounded-full border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* RejectedApplicantMobileCard — "Rejected" tab                        */
/* ------------------------------------------------------------------ */

interface RejectedApplicantMobileCardProps {
  applicant: RecruitmentApplicant;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  canManage?: boolean;
  isMutating?: boolean;
  onDelete: (applicant: RecruitmentApplicant) => void;
}

export const RejectedApplicantMobileCard = ({
  applicant,
  selected,
  onToggleSelect,
  canManage = false,
  isMutating = false,
  onDelete,
}: RejectedApplicantMobileCardProps) => {
  return (
    <div className="space-y-3 rounded-xl border border-[#ececec] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(applicant.id)}
            className="mt-1 data-[state=checked]:border-[#1C9DDE] data-[state=checked]:bg-[#1C9DDE]"
          />
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
            <p className="text-muted-foreground truncate text-xs">
              {applicant.email}
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={isMutating}
            onClick={() => onDelete(applicant)}
            aria-label={`Delete ${applicant.name}`}
            className="h-8 w-8 shrink-0 rounded-full border text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">ID Number</p>
          <p className="font-medium">{applicant.id_number || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Course / Year</p>
          <p className="font-medium">
            {[applicant.course, applicant.year].filter(Boolean).join(" • ") ||
              "—"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs">Role Applied</p>
          <p className="font-medium">{applicant.roleApplied || "—"}</p>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* PositionMobileCard — "Open Roles" tab                               */
/* ------------------------------------------------------------------ */

interface PositionMobileCardProps {
  position: RecruitmentPosition;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  canManage?: boolean;
  isMutating?: boolean;
  onEdit: (position: RecruitmentPosition) => void;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
  onDelete: (position: RecruitmentPosition) => void;
}

export const PositionMobileCard = ({
  position,
  selected,
  onToggleSelect,
  canManage = false,
  isMutating = false,
  onEdit,
  onClose,
  onReopen,
  onDelete,
}: PositionMobileCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-[#ececec] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(position._id)}
            className="mt-1 data-[state=checked]:border-[#1C9DDE] data-[state=checked]:bg-[#1C9DDE]"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {position.title}
            </p>
            <span
              className={cn(
                "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                POSITION_STATUS_STYLES[position.hiringStatus] ??
                  "bg-slate-100 text-slate-600"
              )}
            >
              {position.hiringStatus}
            </span>
          </div>
        </div>

        {canManage && (
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={isMutating}
                className="h-8 w-8 shrink-0 rounded-full border text-slate-500 hover:bg-slate-100"
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
                  onEdit(position);
                  setMenuOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4 text-slate-500" />
                Edit Role Application
              </button>

              {position.hiringStatus === "CLOSED" ? (
                <button
                  type="button"
                  onClick={() => {
                    onReopen(position._id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-emerald-600 hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reopen Role Application
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose(position._id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                >
                  <Ban className="h-4 w-4" />
                  Close Role Application
                </button>
              )}

              {position.hiringStatus === "CLOSED" && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(position);
                    setMenuOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Role Application
                </button>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Slots</p>
          <p className="font-medium">{position.slots ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Deadline</p>
          <p className="font-medium">
            {position.applicationDeadline
              ? new Date(position.applicationDeadline).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs">Created</p>
          <p className="font-medium">
            {new Date(position.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
