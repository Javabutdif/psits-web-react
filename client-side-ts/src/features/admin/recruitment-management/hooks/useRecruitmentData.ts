// src/features/admin/recruitment-management/hooks/useRecruitmentData.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminPermissions";

import type {
  RecruitmentApplicant,
  RecruitmentFilters,
  RecruitmentSort,
  RecruitmentSortField,
  RecruitmentTab,
  ScheduleInterviewValues,
  RecruitmentPosition,
  OpenRecruitmentValues,
  RecruitmentOpeningConflictError,
} from "../types/Recruitment.types";

import {
  getApplicants,
  getApplicationDetails,
  updateApplicationStatus,
  createInterview,
  updateInterview,
  getResumeUrl,
  downloadResumeFile,
  listPositions,
  createOpening,
  updatePosition as updatePositionApi,
  toggleHiringStatus,
  verifyApplicantAccount,
  deleteApplication,
  deletePosition as deletePositionApi,
} from "../../../../api/recruitment.api";

export const ROWS_PER_PAGE = 8;
export const POSITIONS_PER_PAGE = 8;

export const DEFAULT_FILTERS: RecruitmentFilters = {
  roles: [],
  courses: [],
  years: [],
  status: "all",
};

const DEFAULT_SORT: RecruitmentSort = {
  field: "name",
  direction: "asc",
};

interface RawApplicantRecord {
  id?: string;
  _id?: string;
  id_number?: string;
  studentId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  course?: string;
  year?: string | number;
  roleApplied?: string;
  position?: { title?: string };
  positionTitle?: string;
  campus?: string;
  status?: string;
  resume?: string;
  resumeUrl?: string;
  aiSummary?: string;
  interview?: {
    scheduledAt?: string;
    location?: string;
    notes?: string;
  };
  interviewDate?: string;
  interviewStart?: string;
  interviewEnd?: string;
  interviewOfficer?: string;
  interviewType?: string;
  // Populated variant returned by getApplicationDetails
  applicantSnapshot?: {
    name?: string;
    idNumber?: string;
    email?: string;
    course?: string;
    year?: string | number;
  };
  applicant?: {
    email?: string;
    course?: string;
    year?: string | number;
  };
  documents?: {
    resume?: {
      storageKey?: string;
      originalFilename?: string;
      mimeType?: string;
      size?: number;
      uploadTimestamp?: string;
      url?: string;
    };
  };
  volunteerAccount?: {
    username?: string;
    tempPassword?: string;
    createdAt?: string;
  };
}

const STATUS_LABELS: Record<string, RecruitmentApplicant["status"]> = {
  SUBMITTED: "Pending",
  INTERVIEW_SCHEDULED: "Scheduled",
  INTERVIEWING: "Interview Completed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Rejected",
};

function formatTime12Hour(time24: string) {
  const [time, meridiem] = time24.split(" ");
  if (time && meridiem) return time24;

  const [hourText, minuteText] = time24.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText || 0);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return time24;

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function parseInterviewNotes(notes?: string) {
  const officerMatch = notes?.match(/officer in charge:\s*(.+?)(?:;|$)/i);
  const typeMatch = notes?.match(/interview type:\s*(.+?)(?:;|$)/i);
  const startMatch = notes?.match(/starts\s*([^;]+?)(?:;|$)/i);
  const endMatch = notes?.match(/ends\s*([^;]+?)(?:;|$)/i);

  return {
    officer: officerMatch?.[1]?.trim() ?? "",
    type: typeMatch?.[1]?.trim() ?? "",
    starts: startMatch?.[1]?.trim() ?? "",
    ends: endMatch?.[1]?.trim() ?? "",
  };
}

function mapApplication(raw: RawApplicantRecord): RecruitmentApplicant {
  const interviewNotes = raw.interview?.notes ?? "";
  const parsedInterviewNotes = parseInterviewNotes(interviewNotes);

  return {
    id: raw.id ?? raw._id ?? "",
    id_number:
      raw.applicantSnapshot?.idNumber ?? raw.id_number ?? raw.studentId ?? "",
    name:
      raw.applicantSnapshot?.name ??
      raw.name ??
      `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim(),
    email: raw.applicantSnapshot?.email ?? raw.email ?? "",
    course: String(
      raw.applicantSnapshot?.course ?? raw.applicant?.course ?? raw.course ?? ""
    ),
    year: String(
      raw.applicantSnapshot?.year ?? raw.applicant?.year ?? raw.year ?? ""
    ),
    roleApplied:
      raw.roleApplied ?? raw.position?.title ?? raw.positionTitle ?? "",
    campus: raw.campus ?? "",
    status:
      STATUS_LABELS[raw.status as string] ??
      (raw.status as RecruitmentApplicant["status"]),
    resume:
      raw.documents?.resume?.url ??
      raw.documents?.resume?.storageKey ??
      raw.resume ??
      raw.resumeUrl,
    resumeFilename: raw.documents?.resume?.originalFilename,
    aiSummary: raw.aiSummary,
    interviewDate: raw.interview?.scheduledAt ?? raw.interviewDate,
    interviewStart: parsedInterviewNotes.starts || raw.interviewStart || "",
    interviewEnd: parsedInterviewNotes.ends || raw.interviewEnd || "",
    interviewOfficer:
      parsedInterviewNotes.officer || raw.interviewOfficer || "",
    interviewType: parsedInterviewNotes.type || raw.interviewType || "",
    volunteerAccount: raw.volunteerAccount
      ? {
          username: raw.volunteerAccount.username ?? "",
          tempPassword: raw.volunteerAccount.tempPassword ?? "",
        }
      : undefined,
  };
}

function toInterviewPayload(values: ScheduleInterviewValues) {
  return {
    scheduledAt: new Date(
      `${values.date}T${values.startTime}:00+08:00`
    ).toISOString(),
    location: "",
    notes: `Interview type: ${values.interviewType}; officer in charge: ${values.officer}; starts ${formatTime12Hour(values.startTime)}; ends ${formatTime12Hour(values.endTime)}`,
  };
}

const STATUS = {
  submitted: "SUBMITTED",
  interviewScheduled: "INTERVIEW_SCHEDULED",
  interviewing: "INTERVIEWING",
  approved: "APPROVED",
  rejected: "REJECTED",
  withdrawn: "WITHDRAWN",
} as const;

export const useRecruitmentData = () => {
  const { canManageRecruitment } = useAdminPermissions();
  const [activeTab, setActiveTab] = useState<RecruitmentTab>("applicants");
  const [applicants, setApplicants] = useState<RecruitmentApplicant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<RecruitmentFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<RecruitmentSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [isPositionsLoading, setIsPositionsLoading] = useState(true);
  const [positionsError, setPositionsError] = useState<string | null>(null);
  const [positionsPage, setPositionsPage] = useState(1);
  const [positionsTotalPages, setPositionsTotalPages] = useState(1);
  const [positionsTotal, setPositionsTotal] = useState(0);
  const [openPositionsCount, setOpenPositionsCount] = useState(0);

  const [mutationError, setMutationError] = useState<string | null>(null);

  const clearMutationError = useCallback(() => setMutationError(null), []);

  // ── Applicant details dialog state ────────────────────────────────────
  const [selectedApplicant, setSelectedApplicant] =
    useState<RecruitmentApplicant | null>(null);

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [detailsError, setDetailsError] = useState<string | null>(null);

  // ── Resume download state ──────────────────────────────────────────────
  // Signed URLs expire quickly (5 min), so we never cache one — always
  // fetch a fresh one right when the user tries to view/download.
  const [isResumeLoading, setIsResumeLoading] = useState(false);

  const [resumeError, setResumeError] = useState<string | null>(null);

  const viewResume = useCallback(async (id: string) => {
    setIsResumeLoading(true);
    setResumeError(null);
    try {
      const res = await getResumeUrl(id);
      const url = res.data.data.url;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setResumeError(
        err instanceof Error ? err.message : "Failed to load resume"
      );
    } finally {
      setIsResumeLoading(false);
    }
  }, []);

  const downloadResume = useCallback(async (id: string) => {
    setIsResumeLoading(true);
    setResumeError(null);
    try {
      const res = await downloadResumeFile(id);
      const disposition = res.headers["content-disposition"] as
        string | undefined;
      const defaultFileName = "resume.pdf";
      const match = disposition?.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
      const fileName = match
        ? decodeURIComponent(match[1].replace(/"/g, ""))
        : defaultFileName;

      const contentTypeHeader = res.headers["content-type"];
      const blob = new Blob([res.data], {
        type:
          typeof contentTypeHeader === "string"
            ? contentTypeHeader
            : "application/octet-stream",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = fileName || defaultFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setResumeError(
        err instanceof Error ? err.message : "Failed to load resume"
      );
    } finally {
      setIsResumeLoading(false);
    }
  }, []);

  const fetchApplicants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getApplicants({});
      const list = res.data.data.applicants;
      setApplicants(list.map(mapApplication));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load applicants"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPositions = useCallback(
    async (pageNumber = positionsPage) => {
      setIsPositionsLoading(true);
      setPositionsError(null);
      try {
        const res = await listPositions({
          page: pageNumber,
          limit: POSITIONS_PER_PAGE,
        });
        const payload = res.data.data;
        const pagination = payload.pagination;

        setPositions(payload.positions || []);
        setPositionsTotalPages(Number(pagination?.totalPages || 1));
        setPositionsTotal(Number(pagination?.total || 0));
      } catch (err) {
        setPositionsError(
          err instanceof Error ? err.message : "Failed to load positions"
        );
      } finally {
        setIsPositionsLoading(false);
      }
    },
    [positionsPage]
  );

  const fetchOpenPositionsCount = useCallback(async () => {
    try {
      const res = await listPositions({ status: "OPEN", limit: 1 });
      setOpenPositionsCount(Number(res.data.data.pagination?.total || 0));
    } catch {
      // Non-critical — the stat card just won't update this cycle.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount; fetchPositions is also used for refetch, so its internal setIsPositionsLoading/setPositionsError calls are needed there
    fetchPositions();
  }, [fetchPositions]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    fetchOpenPositionsCount();
  }, [fetchOpenPositionsCount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount; fetchApplicants is also used for refetch, so its internal setIsLoading/setError calls are needed there
    fetchApplicants();
  }, [fetchApplicants]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount; setIsLoading/setError also serve the exposed refetch() path
    setPage(1);
  }, [filters, search]);

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applicants
      .filter((applicant) => {
        if (
          query &&
          ![
            applicant.name,
            applicant.id_number,
            applicant.email,
            applicant.course,
            applicant.year,
            applicant.roleApplied,
            applicant.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        if (
          filters.roles.length > 0 &&
          !filters.roles.includes(applicant.roleApplied)
        ) {
          return false;
        }

        if (
          filters.courses.length > 0 &&
          !filters.courses.includes(applicant.course)
        ) {
          return false;
        }

        if (filters.years.length > 0) {
          // applicant.year may be "1st Year", "2", etc. — normalize to the
          // leading digit so the filter values ("1".."4") match.
          const yearDigit = String(applicant.year).match(/\d+/)?.[0] ?? "";
          if (!filters.years.includes(yearDigit)) {
            return false;
          }
        }

        if (filters.status !== "all" && applicant.status !== filters.status) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        let leftValue = "";
        let rightValue = "";

        switch (sort.field) {
          case "courseYear":
            leftValue = `${left.course} ${left.year}`;
            rightValue = `${right.course} ${right.year}`;
            break;

          case "roleApplied":
            leftValue = left.roleApplied;
            rightValue = right.roleApplied;
            break;

          default:
            leftValue = String(
              left[sort.field as keyof RecruitmentApplicant] ?? ""
            );

            rightValue = String(
              right[sort.field as keyof RecruitmentApplicant] ?? ""
            );
        }

        const result = leftValue.localeCompare(rightValue, undefined, {
          numeric: true,
          sensitivity: "base",
        });

        return sort.direction === "asc" ? result : -result;
      });
  }, [applicants, search, filters, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplicants.length / ROWS_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const pagedApplicants = filteredApplicants.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const roleOptions = useMemo(
    () =>
      Array.from(
        new Set(
          applicants.map((applicant) => applicant.roleApplied).filter(Boolean)
        )
      ).sort(),
    [applicants]
  );

  const toggleSort = (field: RecruitmentSortField) => {
    setSort((current) =>
      current.field === field
        ? {
            field,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : {
            field,
            direction: "asc",
          }
    );
  };

  const toggleApplicantSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // ── Applicant details (view modal) ─────────────────────────────────────
  const viewApplicantDetails = useCallback(async (id: string) => {
    setIsDetailsLoading(true);
    setDetailsError(null);
    setSelectedApplicant(null);

    try {
      const res = await getApplicationDetails(id);
      setSelectedApplicant(mapApplication(res.data.data));
    } catch (err) {
      setDetailsError(
        err instanceof Error ? err.message : "Failed to load applicant details"
      );
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  const closeApplicantDetails = useCallback(() => {
    setSelectedApplicant(null);
    setDetailsError(null);
  }, []);

  const rejectApplicant = async (id: string) => {
    if (!canManageRecruitment) {
      setMutationError("You don't have permission to reject applicants.");
      return;
    }
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await updateApplicationStatus(id, {
        status: STATUS.rejected,
      });
      const updated = mapApplication(res.data.data);
      setApplicants((current) =>
        current.map((a) => (a.id === id ? updated : a))
      );
      setSelectedApplicant((current) =>
        current?.id === id ? updated : current
      );
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to reject applicant"
      );
    } finally {
      setIsMutating(false);
    }
  };

  // SUBMITTED → INTERVIEW_SCHEDULED (was "verifyApplicant" — renamed to match reality)
  const moveToInterviewScheduled = async (id: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await updateApplicationStatus(id, {
        status: STATUS.interviewScheduled,
      });
      const updated = mapApplication(res.data.data);
      setApplicants((current) =>
        current.map((a) => (a.id === id ? updated : a))
      );
      setSelectedApplicant((current) =>
        current?.id === id ? updated : current
      );
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to update applicant"
      );
    } finally {
      setIsMutating(false);
    }
  };

  // INTERVIEW_SCHEDULED → INTERVIEWING
  const moveToInterviewing = async (id: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await updateApplicationStatus(id, {
        status: STATUS.interviewing,
      });
      const updated = mapApplication(res.data.data);
      setApplicants((current) =>
        current.map((a) => (a.id === id ? updated : a))
      );
      setSelectedApplicant((current) =>
        current?.id === id ? updated : current
      );
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to update applicant"
      );
    } finally {
      setIsMutating(false);
    }
  };

  // INTERVIEWING → APPROVED (only valid step for real "Approve")
  const approveApplicant = async (id: string) => {
    if (!canManageRecruitment) {
      setMutationError("You don't have permission to approve applicants.");
      return;
    }
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await updateApplicationStatus(id, {
        status: STATUS.approved,
      });
      const updated = mapApplication(res.data.data);
      setApplicants((current) =>
        current.map((a) => (a.id === id ? updated : a))
      );
      setSelectedApplicant((current) =>
        current?.id === id ? updated : current
      );
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to approve applicant"
      );
    } finally {
      setIsMutating(false);
    }
  };

  // Create a new interview for an applicant (uses createInterview API)
  const scheduleInterview = async (
    id: string,
    values: ScheduleInterviewValues
  ) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await createInterview(id, toInterviewPayload(values));
      const updated = mapApplication(res.data.data);
      setApplicants((current) =>
        current.map((a) => (a.id === id ? updated : a))
      );
      setSelectedApplicant((current) =>
        current?.id === id ? updated : current
      );
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to schedule interview"
      );
    } finally {
      setIsMutating(false);
    }
  };

  const openRoleApplication = async (data: OpenRecruitmentValues) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      await createOpening({
        ...data,
        roleRequirements: data.roleRequirements ?? "",
      });
      setPositionsPage(1);
      await fetchPositions(1);
      await fetchOpenPositionsCount();
    } catch (err) {
      const response = (
        err as {
          response?: {
            status?: number;
            data?: {
              code?: string;
              message?: string;
              data?: {
                conflicts?: RecruitmentOpeningConflictError["conflicts"];
              };
            };
          };
        }
      ).response;

      if (
        response?.status === 409 &&
        response.data?.code === "RECRUITMENT_POSITION_CONFLICT"
      ) {
        const conflictError = new Error(
          response.data.message ||
            "Some selected role applications already exist."
        ) as RecruitmentOpeningConflictError;
        conflictError.code = "RECRUITMENT_POSITION_CONFLICT";
        conflictError.conflicts = response.data.data?.conflicts ?? [];
        setMutationError(conflictError.message);
        throw conflictError;
      }

      setMutationError(
        err instanceof Error ? err.message : "Failed to open role application"
      );
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const updatePosition = async (
    id: string,
    data: Partial<
      Pick<
        RecruitmentPosition,
        "title" | "slots" | "applicationDeadline" | "requirements"
      >
    >
  ) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await updatePositionApi(id, data);
      const updated = res.data.data;
      setPositions((current) =>
        current.map((p) => (p._id === id ? updated : p))
      );
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to update position"
      );
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const closePosition = async (id: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await toggleHiringStatus(id, "CLOSED");
      const updated = res.data.data;
      setPositions((current) =>
        current.map((p) => (p._id === id ? updated : p))
      );
      await fetchOpenPositionsCount();
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to close role"
      );
    } finally {
      setIsMutating(false);
    }
  };

  const reopenPosition = async (id: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await toggleHiringStatus(id, "OPEN");
      const updated = res.data.data;
      setPositions((current) =>
        current.map((p) => (p._id === id ? updated : p))
      );
      await fetchOpenPositionsCount();
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to reopen role"
      );
    } finally {
      setIsMutating(false);
    }
  };
  // Delete a position (only for CLOSED roles — the UI gates this).
  // The backend hard-deletes if no applications exist, otherwise
  // soft-disables (isActive = false).
  const deletePosition = async (id: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      await deletePositionApi(id);
      const nextPage =
        positions.length === 1 && positionsPage > 1
          ? positionsPage - 1
          : positionsPage;

      if (nextPage !== positionsPage) {
        setPositionsPage(nextPage);
      }

      await fetchPositions(nextPage);
      await fetchOpenPositionsCount();
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to delete position"
      );
    } finally {
      setIsMutating(false);
    }
  };

  // Update an existing interview for an applicant (uses updateInterview API)
  const rescheduleInterview = async (
    id: string,
    values: ScheduleInterviewValues
  ) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const res = await updateInterview(id, toInterviewPayload(values));
      const updated = mapApplication(res.data.data);
      setApplicants((current) =>
        current.map((a) => (a.id === id ? updated : a))
      );
      setSelectedApplicant((current) =>
        current?.id === id ? updated : current
      );
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to reschedule interview"
      );
    } finally {
      setIsMutating(false);
    }
  };

  // ── Verification (approve → auto-create volunteer account) ────────────
  // "For Verification" applicants are Approved applicants who don't have a
  // volunteerAccount yet. verifyApplicantAccount calls the backend endpoint
  // that creates the account and returns { username, tempPassword }.
  const [verifiedAccount, setVerifiedAccount] = useState<{
    name: string;
    role: string;
    username: string;
    tempPassword: string;
  } | null>(null);

  const verificationApplicants = useMemo(
    () =>
      applicants.filter((a) => a.status === "Approved" && !a.volunteerAccount),
    [applicants]
  );

  const verifyApplicant = useCallback(
    async (id: string) => {
      if (!canManageRecruitment) {
        setMutationError("You don't have permission to verify applicants.");
        return;
      }
      setIsMutating(true);
      setMutationError(null);
      try {
        const applicant = applicants.find((a) => a.id === id);
        if (!applicant) throw new Error("Applicant not found");

        const res = await verifyApplicantAccount(id);
        const account = res.data.data; // { username, tempPassword } from backend

        setApplicants((current) =>
          current.map((a) =>
            a.id === id ? { ...a, volunteerAccount: account } : a
          )
        );
        setVerifiedAccount({
          name: applicant.name,
          role: applicant.roleApplied,
          username: account.username,
          tempPassword: account.tempPassword,
        });
      } catch (err) {
        setMutationError(
          err instanceof Error ? err.message : "Failed to verify applicant"
        );
      } finally {
        setIsMutating(false);
      }
    },
    [applicants, canManageRecruitment]
  );

  // ── Rejected applicants (delete) ───────────────────────────────────────
  const rejectedApplicants = useMemo(
    () => applicants.filter((a) => a.status === "Rejected"),
    [applicants]
  );

  const deleteRejectedApplicant = async (id: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      await deleteApplication(id);
      setApplicants((current) => current.filter((a) => a.id !== id));
      setSelectedApplicant((current) => (current?.id === id ? null : current));
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to delete applicant"
      );
    } finally {
      setIsMutating(false);
    }
  };

  const clearAllRejectedApplicants = async () => {
    setIsMutating(true);
    setMutationError(null);
    try {
      const ids = rejectedApplicants.map((a) => a.id);
      await Promise.all(ids.map((id) => deleteApplication(id)));
      setApplicants((current) =>
        current.filter((a) => a.status !== "Rejected")
      );
    } catch (err) {
      setMutationError(
        err instanceof Error
          ? err.message
          : "Failed to clear rejected applicants"
      );
      // Refetch to reconcile partial failures
      await fetchApplicants();
    } finally {
      setIsMutating(false);
    }
  };

  const clearVerifiedAccount = useCallback(() => setVerifiedAccount(null), []);

  return {
    activeTab,
    setActiveTab,
    applicants,
    filteredApplicants,
    pagedApplicants,
    selectedIds,
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    page,
    setPage,
    totalPages,
    currentPage,
    positionsPage,
    setPositionsPage,
    positionsTotalPages,
    positionsTotal,
    openPositionsCount,
    isLoading,
    isMutating,
    error,
    mutationError,
    clearMutationError,
    roleOptions,
    toggleSort,
    toggleApplicantSelection,
    clearSelection,
    approveApplicant,
    rejectApplicant,
    moveToInterviewScheduled,
    moveToInterviewing,
    scheduleInterview,
    rescheduleInterview,
    refetch: fetchApplicants,
    selectedApplicant,
    isDetailsLoading,
    detailsError,
    viewApplicantDetails,
    closeApplicantDetails,
    viewResume,
    downloadResume,
    isResumeLoading,
    resumeError,
    positions,
    isPositionsLoading,
    positionsError,
    openRoleApplication,
    updatePosition,
    closePosition,
    reopenPosition,
    deletePosition,
    verificationApplicants,
    verifyApplicant,
    verifiedAccount,
    clearVerifiedAccount,
    rejectedApplicants,
    deleteRejectedApplicant,
    clearAllRejectedApplicants,
  };
};
