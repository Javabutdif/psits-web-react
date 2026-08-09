import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/features/auth";
import { getStudentProfileV2 } from "@/features/student";
import {
  listPositions,
  submitApplication,
  getApplicationsForUser,
} from "@/api/recruitment.api";
import type { Application, RecruitmentPosition } from "@/types/recruitment";
import { RECRUITMENT_ROLE_CATALOG } from "@/constants/recruitmentRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Upload, Check, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const COURSES = ["BSIT", "BSCS"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const POSITIONS_PAGE_LIMIT = 100;
const YEAR_MAP: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
};

const getPositionTimestamp = (position: RecruitmentPosition) => {
  const timestamp = new Date(
    position.updatedAt || position.createdAt
  ).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const normalizePositionLabel = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const getPositionKey = (role: string, position: string | null) =>
  `${normalizePositionLabel(role)}:${normalizePositionLabel(position || role)}`;

const parsePositionTitle = (title: string) => {
  const [base, ...rest] = title.split(" - ");
  return {
    baseRole: base.trim(),
    subLabel: rest.length > 0 ? rest.join(" - ").trim() : null,
  };
};

const isPositionCurrentlyOpen = (position?: RecruitmentPosition) => {
  if (
    !position ||
    position.isActive === false ||
    position.hiringStatus !== "OPEN"
  ) {
    return false;
  }

  const now = Date.now();
  const deadline = position.applicationDeadline
    ? new Date(position.applicationDeadline).getTime()
    : null;

  if (deadline && Number.isFinite(deadline) && deadline < now) return false;

  return true;
};

type StatusStep = {
  key: string;
  label: string;
  description: string;
};

const STATUS_STEPS: StatusStep[] = [
  {
    key: "SUBMITTED",
    label: "Submitted",
    description: "Your application has been received and is pending review.",
  },
  {
    key: "UNDER_REVIEW",
    label: "Under review",
    description:
      "Your application is being reviewed by the PSITS team before the interview stage.",
  },
  {
    key: "INTERVIEW_SCHEDULED",
    label: "Set schedule",
    description: "An interview schedule has been assigned to your application.",
  },
  {
    key: "INTERVIEWING",
    label: "Interview",
    description: "Your interview is currently being completed and evaluated.",
  },
  {
    key: "APPROVED",
    label: "Decision Pending",
    description:
      "Your application is now waiting for the final approval decision.",
  },
  {
    key: "DONE",
    label: "Approved",
    description:
      "Congratulations! Your application has been approved. Please check your email for the next steps.",
  },
];

const REJECTED_STEP: StatusStep = {
  key: "REJECTED",
  label: "Rejected",
  description:
    "Thank you for your interest. We encourage you to apply again in the future.",
};

function formatInterviewDate(date: Date | null) {
  if (!date) return "";

  return date.toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function normalizeInterviewEndLabel(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const timeOnlyMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/i);
  if (timeOnlyMatch) {
    const hour = Number(timeOnlyMatch[1]);
    const minute = Number(timeOnlyMatch[2]);

    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
      const suffix = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
    }
  }

  return trimmed;
}

function parseInterviewNotes(notes?: string) {
  const officerMatch = notes?.match(/officer in charge:\s*(.+?)(?:;|$)/i);
  const typeMatch = notes?.match(/interview type:\s*(.+?)(?:;|$)/i);
  const startsMatch = notes?.match(/starts\s*([^;]+)$/i);
  const endsMatch = notes?.match(/ends\s*([^;]+)$/i);

  return {
    officer: officerMatch?.[1]?.trim() ?? "",
    type: typeMatch?.[1]?.trim() ?? "",
    starts: normalizeInterviewEndLabel(startsMatch?.[1]?.trim()),
    ends: normalizeInterviewEndLabel(endsMatch?.[1]?.trim()),
  };
}

const ApplicationStatus = ({
  application,
  onReapply,
}: {
  application: Application;
  onReapply?: () => void;
}) => {
  const isRejected = application.status === "REJECTED";
  const isApproved = application.status === "APPROVED";
  const interviewDate = application.interview?.scheduledAt
    ? new Date(application.interview.scheduledAt)
    : null;
  const interviewNotes = application.interview?.notes;
  const interviewStatus = application.interview?.status;
  const parsedInterviewNotes = parseInterviewNotes(interviewNotes);
  const interviewOfficer = parsedInterviewNotes.officer || "";
  const interviewType = parsedInterviewNotes.type || "";
  const interviewStartTime = parsedInterviewNotes.starts || "";
  const interviewEndTime = parsedInterviewNotes.ends || "";
  const isInterviewCompleted = interviewStatus === "COMPLETED";
  const isDecisionPending =
    application.status === "INTERVIEWING" && isInterviewCompleted;
  const latestDecision = application.statusHistory
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    )
    .find((item) => item.status === "APPROVED" || item.status === "REJECTED");

  const currentStep = (() => {
    switch (application.status) {
      case "SUBMITTED":
        return 1;

      case "INTERVIEW_SCHEDULED":
        return 2;

      case "INTERVIEWING":
        return isDecisionPending ? 4 : 3;

      case "APPROVED":
        return 5;

      case "REJECTED":
        return 5;

      default:
        return 0;
    }
  })();

  const steps = isRejected
    ? [...STATUS_STEPS.slice(0, 5), REJECTED_STEP]
    : STATUS_STEPS;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">Application Status</h2>

      <div className="mt-2 mb-5 h-[1.5px] w-full bg-sky-400" />

      <div className="relative">
        {steps.map((step, index) => {
          const active = index <= currentStep;
          const isCurrent = index === currentStep;
          const rejectedHere = isRejected && isCurrent;

          const shouldShowDescription =
            isCurrent || rejectedHere || (index === 0 && currentStep === 1);

          return (
            <div
              key={step.label}
              className="relative flex items-start gap-3 pb-3 last:pb-0"
            >
              {/* Vertical line */}
              {index !== steps.length - 1 && (
                <div
                  className={`absolute top-6 left-[11px] h-full w-[2px] ${
                    index < currentStep ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}

              {/* Filled circle marker */}
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                {rejectedHere ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-red-500">
                        <X className="h-3 w-3 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                ) : active ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-green-500">
                        <Check
                          className="h-3 w-3 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[2px]">
                      <div className="h-full w-full rounded-full bg-gray-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="pt-0.5">
                <p
                  className={`text-base ${
                    isCurrent || rejectedHere
                      ? "font-semibold text-gray-900"
                      : active
                        ? "font-medium text-gray-900"
                        : "font-normal text-gray-400"
                  }`}
                >
                  {step.label}
                </p>

                {shouldShowDescription && step.description && (
                  <p className="mt-0.5 text-sm text-gray-500">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(application.interview || interviewDate || interviewOfficer) &&
        (application.status === "INTERVIEW_SCHEDULED" ||
          application.status === "INTERVIEWING") && (
          <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">
            <p className="mb-2 font-semibold text-sky-800">Interview details</p>
            {interviewDate && (
              <p>
                <span className="font-medium">Scheduled:</span>{" "}
                {formatInterviewDate(interviewDate)}
              </p>
            )}
            {interviewOfficer && (
              <p>
                <span className="font-medium">Officer in charge:</span>{" "}
                {interviewOfficer}
              </p>
            )}
            {interviewStatus && (
              <p>
                <span className="font-medium">Interview status:</span>{" "}
                {interviewStatus}
              </p>
            )}
            {interviewType && (
              <p>
                <span className="font-medium">Interview type:</span>{" "}
                {interviewType}
              </p>
            )}
            {interviewStartTime && (
              <p>
                <span className="font-medium">Starts:</span>{" "}
                {interviewStartTime}
              </p>
            )}
            {interviewEndTime && (
              <p>
                <span className="font-medium">Ends:</span> {interviewEndTime}
              </p>
            )}
          </div>
        )}

      {(isApproved || isRejected) && latestDecision && (
        <div
          className={`mt-6 rounded-2xl border p-4 text-sm ${
            isApproved
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <p className="mb-1 font-semibold">
            {isApproved
              ? "Final decision: Approved"
              : "Final decision: Rejected"}
          </p>
          <p>
            {latestDecision.note ||
              (isApproved
                ? "Congratulations! You have been accepted."
                : "Thank you for your interest. We encourage you to apply again in the future.")}
          </p>
        </div>
      )}

      {isRejected && onReapply && (
        <div className="mt-6 flex justify-center border-t border-gray-100 pt-5">
          <Button type="button" onClick={onReapply} className="w-full max-w-xs">
            Apply Again
          </Button>
        </div>
      )}
    </div>
  );
};

export const ApplicationPage = () => {
  const { user } = useAuth();

  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(true);

  const [existingApplication, setExistingApplication] =
    useState<Application | null>(null);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  // When a rejected applicant chooses to reapply, we keep
  // `existingApplication` around (still REJECTED) but show the form
  // instead of the status page until they submit a new application.
  const [reapplying, setReapplying] = useState(false);

  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [subPosition, setSubPosition] = useState("");
  const [selectedBaseRole, setSelectedBaseRole] = useState("");
  const [positionSelectOpen, setPositionSelectOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    lastName: "",
    middleName: "",
    firstName: "",
    email: "",
    course: "",
    year: "",
  });

  // Profile details come from the server (login session) and are read-only
  // for the student; they cannot be edited on the application form.
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.idNumber) {
        setProfileLoading(false);
        return;
      }
      try {
        const profile = await getStudentProfileV2(user.idNumber);
        setForm({
          studentId: profile.id_number || "",
          firstName: profile.first_name || "",
          middleName: profile.middle_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          course: profile.course || "",
          year: YEAR_MAP[String(profile.year)] || "",
        });
      } catch (err) {
        console.error("Failed to load student profile:", err);
        toast.error("Couldn't load your profile. Refresh to retry.");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user?.idNumber]);

  // Sync the logged-in user's profile fields into the form the first time
  // `user` becomes available (or changes identity). Adjusting state during
  // render — rather than in a useEffect — avoids the extra "commit, then
  // re-render" pass that react-hooks/set-state-in-effect warns about — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [loadedUser, setLoadedUser] = useState(user);
  if (user && user !== loadedUser) {
    setLoadedUser(user);
    setForm((prev) => ({
      ...prev,
      studentId: user.idNumber || prev.studentId,
      email: user.email || prev.email,
      course: user.course || prev.course,
      year:
        user.year !== undefined
          ? YEAR_MAP[String(user.year)] || prev.year
          : prev.year,
      ...(user.name
        ? (() => {
            const parts = user.name.trim().split(/\s+/);
            return {
              firstName: parts[0] || prev.firstName,
              lastName:
                parts.length > 1 ? parts[parts.length - 1] : prev.lastName,
            };
          })()
        : {}),
    }));
  }

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const firstPage = await listPositions({
          status: "OPEN",
          page: 1,
          limit: POSITIONS_PAGE_LIMIT,
        });
        const firstPayload = firstPage.data.data;
        const allPositions: RecruitmentPosition[] = [
          ...(firstPayload?.positions || []),
        ];
        const totalPages = Number(firstPayload?.pagination?.totalPages || 1);

        if (totalPages > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              listPositions({
                status: "OPEN",
                page: index + 2,
                limit: POSITIONS_PAGE_LIMIT,
              })
            )
          );

          remainingPages.forEach((pageResult) => {
            allPositions.push(...(pageResult.data.data?.positions || []));
          });
        }

        setPositions(allPositions);
      } catch (err) {
        console.error("Failed to load positions:", err);
        toast.error("Couldn't load open positions. Try refreshing.");
      } finally {
        setPositionsLoading(false);
      }
    };
    fetchPositions();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await getApplicationsForUser();
        const apps: Application[] = res.data.data || [];
        const active = apps.find((a) => a.status !== "WITHDRAWN");
        setExistingApplication(active || null);
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setApplicationsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const positionsByCatalogKey = useMemo(() => {
    const byKey = new Map<string, RecruitmentPosition>();

    positions.forEach((position) => {
      const { baseRole, subLabel } = parsePositionTitle(position.title);
      const key = getPositionKey(baseRole, subLabel);
      const current = byKey.get(key);
      const nextIsOpen = isPositionCurrentlyOpen(position);
      const currentIsOpen = isPositionCurrentlyOpen(current);

      if (
        !current ||
        (nextIsOpen && !currentIsOpen) ||
        (nextIsOpen === currentIsOpen &&
          getPositionTimestamp(position) > getPositionTimestamp(current))
      ) {
        byKey.set(key, position);
      }
    });

    return byKey;
  }, [positions]);

  const groupedPositions = useMemo(() => {
    const groups: Record<
      string,
      {
        id: string;
        positionId: string;
        subLabel: string | null;
        isOpen: boolean;
        position?: RecruitmentPosition;
      }[]
    > = {};

    RECRUITMENT_ROLE_CATALOG.forEach((role) => {
      if (role.positions.length === 0) {
        const position = positionsByCatalogKey.get(
          getPositionKey(role.title, null)
        );
        groups[role.title] = [
          {
            id: role.id,
            positionId: position?._id || "",
            subLabel: null,
            isOpen: isPositionCurrentlyOpen(position),
            position,
          },
        ];
        return;
      }

      groups[role.title] = role.positions.map((catalogPosition) => {
        const position = positionsByCatalogKey.get(
          getPositionKey(role.title, catalogPosition.name)
        );

        return {
          id: catalogPosition.id,
          positionId: position?._id || "",
          subLabel: catalogPosition.name,
          isOpen: isPositionCurrentlyOpen(position),
          position,
        };
      });
    });

    return groups;
  }, [positionsByCatalogKey]);

  const baseRoleOptions = RECRUITMENT_ROLE_CATALOG.map((role) => role.title);
  const selectedRolePositionOptions = groupedPositions[selectedBaseRole] || [];
  const hasPositionOptions = selectedRolePositionOptions.length > 0;
  const selectedPositionOption = selectedRolePositionOptions.find(
    (item) => item.positionId && item.positionId === selectedPositionId
  );
  const selectedPositionLabel = selectedPositionOption
    ? selectedPositionOption.subLabel ||
      selectedPositionOption.position?.title ||
      selectedBaseRole
    : "";

  const selectedPosition = positions.find((p) => p._id === selectedPositionId);

  const isFormValid =
    selectedPositionId &&
    acknowledged &&
    resume &&
    form.studentId &&
    form.lastName &&
    form.firstName &&
    form.email &&
    form.course &&
    form.year;

  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  const handleResume = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Resume must be a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be under 5MB.");
      return;
    }

    setResume(file);
    setUploadOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleResume(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = () => {
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    handleResume(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !resume) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("studentId", form.studentId);
      formData.append("lastName", form.lastName);
      formData.append("middleName", form.middleName);
      formData.append("firstName", form.firstName);
      formData.append("email", form.email);
      formData.append("course", form.course);
      formData.append("year", form.year);
      if (subPosition) formData.append("subPosition", subPosition);

      const res = await submitApplication(selectedPositionId, formData);
      setExistingApplication(res.data.data);
      setReapplying(false);
      toast.success("Application submitted!");
    } catch (err) {
      console.error("Submission failed:", err);
      const message =
        (err as { response?: { data?: { message?: string; error?: string } } })
          .response?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: string } } })
          .response?.data?.error ||
        "Application submission failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (applicationsLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }

  // Show the status page whenever there's an existing application, unless
  // it's REJECTED and the student has chosen to reapply (`reapplying`).
  if (existingApplication && !reapplying) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-light text-gray-800">
          Submit PSITS membership application
        </h1>
        <ApplicationStatus
          application={existingApplication}
          onReapply={
            existingApplication.status === "REJECTED"
              ? () => setReapplying(true)
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-light text-gray-800">
        Submit PSITS membership application
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:divide-x md:divide-gray-100">
          {/* Role Information */}
          <div className="space-y-4 md:pr-8">
            <h2 className="text-lg font-medium text-gray-800">
              Role Information
            </h2>

            <div className="flex gap-3">
              <Select
                value={selectedBaseRole}
                onValueChange={(v) => {
                  setSelectedBaseRole(v);
                  setSubPosition("");
                  setPositionSelectOpen(false);
                  // If this base role has no sub-labels (e.g. "Volunteer"),
                  // there's only one matching position — select it right away.
                  const group = groupedPositions[v] || [];
                  if (
                    group.length === 1 &&
                    group[0].subLabel === null &&
                    group[0].isOpen
                  ) {
                    setSelectedPositionId(group[0].positionId);
                  } else {
                    setSelectedPositionId("");
                  }
                }}
                disabled={positionsLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      <span>
                        Select role <span className="text-red-500">*</span>
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {baseRoleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover
                open={positionSelectOpen}
                onOpenChange={(open) =>
                  setPositionSelectOpen(
                    open && !!selectedBaseRole && hasPositionOptions
                  )
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedBaseRole}
                    className="h-10 flex-1 justify-between rounded-md border-gray-200 bg-white px-3 text-left text-sm font-normal shadow-none hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      className={
                        selectedPositionLabel
                          ? "truncate text-gray-900"
                          : "truncate text-gray-400"
                      }
                    >
                      {selectedPositionLabel || "Position"}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-1"
                >
                  {selectedRolePositionOptions.map((item) => {
                    const label =
                      item.subLabel || item.position?.title || selectedBaseRole;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!item.isOpen}
                        onClick={() => {
                          if (!item.isOpen || !item.positionId) return;
                          setSubPosition(item.subLabel || "");
                          setSelectedPositionId(item.positionId);
                          setPositionSelectOpen(false);
                        }}
                        className={
                          item.isOpen
                            ? "flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-sm text-[#0274b8] hover:bg-sky-50"
                            : "flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-sm text-slate-400 opacity-60"
                        }
                      >
                        <span className="truncate">{label}</span>
                        <span className="shrink-0 text-[11px]">
                          {item.isOpen ? "Open" : "Closed"}
                        </span>
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-h-[180px] rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
              {selectedPosition ? (
                <div className="space-y-3 text-gray-700">
                  {selectedPosition.description && (
                    <p>{selectedPosition.description}</p>
                  )}
                  {selectedPosition.requirements &&
                    selectedPosition.requirements.length > 0 && (
                      <div>
                        <p className="font-semibold">REQUIREMENTS:</p>
                        <ul className="list-disc pl-4">
                          {selectedPosition.requirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {!selectedPosition.description &&
                    (!selectedPosition.requirements ||
                      selectedPosition.requirements.length === 0) && (
                      <p className="text-gray-400">
                        No additional details provided for this role yet.
                      </p>
                    )}
                </div>
              ) : (
                <div className="flex h-full min-h-[148px] items-center justify-center text-center text-gray-500">
                  Select a role to view role requirements and overview
                </div>
              )}
            </div>

            <label className="text-black-600 flex items-center gap-2">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
                className="-mt-6 border-gray-300 data-[state=checked]:border-[#1C9DDE] data-[state=checked]:bg-[#1C9DDE]"
              />
              I have read and understand the role requirements{" "}
              <span className="text-red-500">*</span>
            </label>

            <div>
              <h3 className="font-medium text-gray-800">Upload resume</h3>
              <p className="mb-2 text-xs text-gray-500">
                Your resume will be analyzed by our system for initial
                screening.
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadOpen(true)}
                  className="gap-1.5 rounded-xl text-sky-500"
                >
                  <Upload className="h-4 w-4 text-sky-500" />
                  Upload File
                </Button>
                <span className="text-sm text-gray-500">
                  {resume ? resume.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4 md:pl-8">
            <h2 className="text-lg font-medium text-gray-800">Personal Info</h2>
            <p className="-mt-2 text-xs text-gray-500">
              Loaded from your account. To update these, edit your account
              profile.
            </p>

            <Input
              placeholder="Student ID Number *"
              value={form.studentId}
              readOnly
              className="bg-slate-50 text-slate-600"
            />
            <Input
              placeholder="Last Name *"
              value={form.lastName}
              readOnly
              className="bg-slate-50 text-slate-600"
            />
            <Input
              placeholder="Middle Name"
              value={form.middleName}
              readOnly
              className="bg-slate-50 text-slate-600"
            />
            <Input
              placeholder="First Name *"
              value={form.firstName}
              readOnly
              className="bg-slate-50 text-slate-600"
            />
            <Input
              type="email"
              placeholder="Email Address *"
              value={form.email}
              readOnly
              className="bg-slate-50 text-slate-600"
            />

            <div className="flex gap-3">
              <Select value={form.course} disabled>
                <SelectTrigger className="flex-1 bg-slate-50 text-slate-600">
                  <SelectValue
                    placeholder={
                      <span>
                        Course <span className="text-red-500">*</span>
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={form.year} disabled>
                <SelectTrigger className="flex-1 bg-slate-50 text-slate-600">
                  <SelectValue
                    placeholder={
                      <span>
                        Year <span className="text-red-500">*</span>
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full max-w-md"
          >
            {submitting ? "Submitting..." : "Submit application"}
          </Button>
        </div>
      </form>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="w-[92vw] max-w-sm rounded-3xl p-6 sm:p-6">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <label
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-sky-500 bg-sky-50" : "border-sky-200"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-sky-400" />
            <span className="text-sm text-gray-600">Drag & drop or browse</span>
            <span className="text-xs text-gray-500">
              Only PDF files are accepted (max 5MB)
            </span>
            <span className="mt-2 rounded-md bg-sky-500 px-4 py-1.5 text-sm text-white">
              Choose File
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationPage;
