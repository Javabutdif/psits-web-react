import { BadgeCheck, CalendarClock, Download, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecruitmentApplicant } from "../types/Recruitment.types";

interface ApplicantInfoDialogProps {
  applicant: RecruitmentApplicant | null;
  open: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSetSchedule: () => void;
  onDownloadResume: (id: string) => void;
  isResumeLoading: boolean;
  resumeError: string | null;
}

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="mb-1 text-[10px] font-semibold tracking-[0.20em] text-slate-500 uppercase">
      {label}
    </p>
    <div className="rounded-xl border border-[#d8e2ec] bg-[#f4f6fa] px-3 py-2 text-[14px] font-medium text-slate-700 shadow-sm">
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
  onDownloadResume,
  isResumeLoading,
  resumeError,
}: ApplicantInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-h-[100vh] !max-w-[700px] gap-0 overflow-hidden rounded-[26px] border-0 bg-white p-0 shadow-[0_22px_80px_rgba(15,23,42,0.18)] [&>button]:hidden"
        showCloseButton={false}
      >
        <div className="relative px-6 py-3">
          <DialogTitle className="mt-3 text-center text-[1.5rem] font-normal text-slate-800">
            Applicant Information
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-1/2 right-6 -translate-y-1/2 cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-4">
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_330px]">
              <div className="space-y-3">
                <Field label="Student ID No" value={applicant.id_number} />
                <Field label="Role Applied" value={applicant.roleApplied} />

                <div>
                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                    Personal Information
                  </p>
                  <div className="space-y-1.5">
                    <Field label="Full Name" value={applicant.name} />
                    <Field label="Email Address" value={applicant.email} />
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="Course" value={applicant.course} />
                      <Field label="Year Level" value={applicant.year} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#d7e3ee] bg-[#f8fbff] p-2.5">
                <p className="mb-2.5 text-[11px] font-semibold text-slate-500 uppercase">
                  Resume
                </p>

                {applicant.resume ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#dbe7f0] bg-white px-3 py-2 shadow-sm">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-slate-800">
                            {applicant.resumeFilename ?? "Resume.pdf"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Opened in new tab
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDownloadResume(applicant.id)}
                        disabled={isResumeLoading}
                        className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Download resume"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDownloadResume(applicant.id)}
                      disabled={isResumeLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#73b8f1] bg-[#eaf5ff] px-4 py-2 text-sm font-semibold text-[#1c9dde] transition hover:bg-[#dff1ff]"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume
                    </button>

                    <p className="flex items-start gap-2 rounded-xl border border-[#d7e8fb] bg-white px-3 py-2 text-sm text-slate-600">
                      <span className="mt-0.5 text-[#1c9dde]">
                        <BadgeCheck className="h-4 w-4" />
                      </span>
                      <span>
                        The resume will open in a new tab. You can view or
                        download it there.
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#d9e4f0] bg-white px-3 py-4 text-sm text-slate-400">
                    No resume uploaded
                  </div>
                )}
                {resumeError && (
                  <p className="mt-3 text-xs text-red-600">{resumeError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {!isLoading && applicant && !error && (
          <div className="mb-5 flex justify-center px-6 pt-3">
            <Button
              type="button"
              className="h-11 rounded-full bg-[#1c9dde] px-9 text-sm font-semibold hover:bg-[#168bc7]"
              onClick={onSetSchedule}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Set Schedule
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantInfoDialog;
