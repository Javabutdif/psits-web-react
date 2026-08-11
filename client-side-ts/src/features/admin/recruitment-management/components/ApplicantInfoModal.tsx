import { BadgeCheck, CalendarClock, Download, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminPermissions";
import type { RecruitmentApplicant } from "../types/Recruitment.types";

interface ApplicantInfoModalProps {
  applicant: RecruitmentApplicant | null;
  open: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSetSchedule: () => void;
  onReschedule: () => void;
  onViewResume: (id: string) => void;
  onDownloadResume: (id: string) => void;
  isResumeLoading: boolean;
  resumeError: string | null;
}

const Field = ({
  label,
  value,
  noUppercase,
}: {
  label: string;
  value?: string;
  noUppercase?: boolean;
}) => (
  <div>
    <p
      className={`mb-1 text-[10px] font-semibold tracking-[0.08em] text-slate-500 ${noUppercase ? "" : "uppercase"}`}
    >
      {label}
    </p>
    <div className="rounded-lg border border-[#d8e2ec] bg-[#f4f6fa] px-2.5 py-1.5 text-[13px] font-medium text-slate-700 shadow-sm">
      {value || "—"}
    </div>
  </div>
);

export const ApplicantInfoModal = ({
  applicant,
  open,
  isLoading,
  error,
  onClose,
  onSetSchedule,
  onReschedule,
  onViewResume,
  onDownloadResume,
  isResumeLoading,
  resumeError,
}: ApplicantInfoModalProps) => {
  const { canManageRecruitment } = useAdminPermissions();
  const hasInterview = Boolean(
    applicant &&
    (applicant.interviewDate ||
      applicant.interviewOfficer ||
      applicant.interviewType ||
      applicant.interviewStart ||
      applicant.interviewEnd)
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="flex max-h-[98vh] w-[95vw] flex-col overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-[0_22px_80px_rgba(15,23,42,0.18)] sm:w-full sm:max-w-[700px] [&>button]:hidden"
        showCloseButton={false}
      >
        <div className="relative shrink-0 px-6 py-3">
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

        <div className="flex-1 overflow-y-auto px-6 pb-4">
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
            <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_330px]">
              <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
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

              <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
                <div className="overflow-hidden rounded-[22px] border border-[#d7e3ee] bg-[#f8fbff] p-2.5">
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
                              Download ready
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
                        onClick={() => onViewResume(applicant.id)}
                        disabled={isResumeLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#73b8f1] bg-[#eaf5ff] px-4 py-2 text-sm font-semibold text-[#1c9dde] transition hover:bg-[#dff1ff]"
                      >
                        <FileText className="h-4 w-4" />
                        View Resume
                      </button>

                      {!hasInterview && (
                        <p className="flex items-start gap-2 rounded-lg border border-[#d7e8fb] bg-white px-3 py-2 text-sm text-slate-600">
                          <span className="mt-0.5 text-[#1c9dde]">
                            <BadgeCheck className="h-4 w-4" />
                          </span>
                          <span>
                            Use the download icon to save a copy, or open the
                            resume directly with View Resume.
                          </span>
                        </p>
                      )}
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

                {hasInterview && (
                  <div className="rounded-[22px] border border-[#cfead9] bg-[#F0F9FF] p-2.5">
                    <div className="mb-2.5 flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                        <CalendarClock className="h-3.5 w-3.5 text-sky-600" />
                        Interview
                      </p>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase">
                        <BadgeCheck className="h-3 w-3" />
                        Scheduled
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {applicant.interviewDate && (
                        <Field
                          label="Scheduled"
                          value={new Date(
                            applicant.interviewDate
                          ).toLocaleString(undefined, {
                            month: "numeric",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          noUppercase
                        />
                      )}
                      {applicant.interviewOfficer && (
                        <Field
                          label="Officer In-charge"
                          value={applicant.interviewOfficer}
                        />
                      )}
                      {applicant.interviewType && (
                        <Field
                          label="Interview Type"
                          value={applicant.interviewType}
                        />
                      )}
                      {(applicant.interviewStart || applicant.interviewEnd) && (
                        <Field
                          label="Time"
                          value={[
                            applicant.interviewStart,
                            applicant.interviewEnd,
                          ]
                            .filter(Boolean)
                            .join(" – ")}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!isLoading && applicant && !error && (
          <div className="mt-auto flex shrink-0 justify-center gap-3 px-6 py-4">
            {hasInterview ? (
              <>
                {canManageRecruitment && (
                  <Button
                    type="button"
                    className="h-11 rounded-full bg-[#1c9dde] px-9 text-sm font-semibold hover:bg-[#168bc7]"
                    onClick={onReschedule}
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Reschedule Interview
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full px-9 text-sm font-semibold"
                  onClick={onClose}
                >
                  Close
                </Button>
              </>
            ) : canManageRecruitment ? (
              <Button
                type="button"
                className="h-11 rounded-full bg-[#1c9dde] px-9 text-sm font-semibold hover:bg-[#168bc7]"
                onClick={onSetSchedule}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Set Schedule
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 rounded-full bg-[#1c9dde] px-9 text-sm font-semibold hover:bg-[#168bc7]"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantInfoModal;