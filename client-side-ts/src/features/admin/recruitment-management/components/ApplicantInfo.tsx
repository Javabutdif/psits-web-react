import { Download, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecruitmentApplicant } from "../types/Recruitment.types";

interface ApplicantInfoDialogProps {
  applicant: RecruitmentApplicant | null;
  open: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSetSchedule: () => void;
}

function getFilenameFromUrl(url?: string) {
  if (!url) return "resume.pdf";
  try {
    const clean = url.split("?")[0];
    return decodeURIComponent(clean.substring(clean.lastIndexOf("/") + 1));
  } catch {
    return "resume.pdf";
  }
}

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-muted-foreground mb-1 text-xs">{label}</p>
    <div className="rounded-md border border-[#ececec] bg-slate-50 px-3 py-2 text-sm text-slate-700">
      {value || "—"}
    </div>
  </div>
);

export const ApplicantInfoDialog = ({
  applicant,
  open,
  isLoading,
  error,
  onClose,
  onSetSchedule,
}: ApplicantInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl gap-0 rounded-3xl p-0 [&>button]:hidden"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Applicant Information
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : isLoading || !applicant ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-16 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div className="space-y-4">
                <Field label="Student ID No" value={applicant.id_number} />
                <Field label="Role Applied" value={applicant.roleApplied} />

                <div>
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Personal Info
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-md border border-[#ececec] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {applicant.name}
                    </div>
                    <div className="rounded-md border border-[#ececec] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {applicant.email}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md border border-[#ececec] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {applicant.course}
                      </div>
                      <div className="rounded-md border border-[#ececec] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {applicant.year}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500">
                  Resume Summary
                </p>

                {applicant.resume ? (
                  <div className="flex items-center justify-between rounded-md border border-[#ececec] px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-red-50 text-red-500">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm text-slate-700">
                        {getFilenameFromUrl(applicant.resume)}
                      </span>
                    </div>
                    href={applicant.resume}
                    download target="_blank" rel="noopener noreferrer"
                    className="shrink-0 rounded-full p-1.5 text-slate-500
                    hover:bg-slate-100" aria-label="Download resume"
                    <a>
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-[#ececec] px-3 py-2 text-sm text-slate-400">
                    No resume uploaded
                  </div>
                )}

                <div className="h-[168px] overflow-y-auto rounded-md border border-[#ececec] px-3 py-2 text-sm text-slate-600">
                  {applicant.aiSummary || (
                    <span className="text-slate-400">
                      AI summarized content
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {!isLoading && applicant && !error && (
          <div className="flex justify-center border-t border-[#f0f0f0] px-6 py-5">
            <Button
              type="button"
              className="h-9 rounded-full bg-[#1c9dde] px-8 hover:bg-[#168bc7]"
              onClick={onSetSchedule}
            >
              Set Schedule
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantInfoDialog;
