import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminPermissions";
import type { RecruitmentApplicant } from "../types/Recruitment.types";

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

interface VerificationModalProps {
  applicant: RecruitmentApplicant;
  isApproving: boolean;
  onApprove: (id: string) => void;
}

export const VerificationModal = ({
  applicant,
  isApproving,
  onApprove,
}: VerificationModalProps) => {
  const { canManageRecruitment } = useAdminPermissions();
  return (
    <div className="flex flex-col rounded-2xl border border-[#e5e5e5] bg-white p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white",
            getAvatarColor(applicant.name)
          )}
        >
          {getInitial(applicant.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900">
            {applicant.name || "—"}
          </p>
          <p className="truncate text-xs text-slate-400">
            {applicant.roleApplied || "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Student ID:{" "}
            <span className="text-slate-700">{applicant.id_number || "—"}</span>
          </p>
          <p className="truncate text-xs text-slate-500">
            Email:{" "}
            <span className="text-slate-700">{applicant.email || "—"}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        <p className="font-medium text-slate-600">Account</p>
        <p className="mt-1">
          Username: <span className="text-slate-400">pending approval</span>
        </p>
        <p>
          Password: <span className="text-slate-400">pending approval</span>
        </p>
      </div>

      {canManageRecruitment && (
        <Button
          type="button"
          disabled={isApproving}
          onClick={() => onApprove(applicant.id)}
          className="mt-4 h-9 w-full rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>
      )}
    </div>
  );
};

export default VerificationModal;
