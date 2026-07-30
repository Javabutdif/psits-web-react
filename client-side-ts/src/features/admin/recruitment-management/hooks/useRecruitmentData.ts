// src/features/admin/recruitment-management/hooks/useRecruitmentData.ts

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  RecruitmentApplicant,
  RecruitmentFilters,
  RecruitmentSort,
  RecruitmentSortField,
  RecruitmentTab,
  ScheduleInterviewValues,
} from "../types/Recruitment.types";

// Adjust this path if your actual file structure differs
import {
  getApplicants,
  getApplicationDetails,
  updateApplicationStatus,
  createInterview,
  updateInterview,
  getResumeUrl,
} from "../../../../api/recruitment.api";

export const ROWS_PER_PAGE = 8;

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
  year?: string;
  roleApplied?: string;
  position?: { title?: string };
  positionTitle?: string;
  campus?: string;
  status?: RecruitmentApplicant["status"];
  resume?: string;
  resumeUrl?: string;
  aiSummary?: string;
  interview?: {
    scheduledAt?: string;
    location?: string;
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
  };
  applicant?: {
    email?: string;
    course?: string;
    year?: string;
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
}

function mapApplication(raw: RawApplicantRecord): RecruitmentApplicant {
  return {
    id: raw.id ?? raw._id ?? "",
    id_number:
      raw.applicantSnapshot?.idNumber ?? raw.id_number ?? raw.studentId ?? "",
    name:
      raw.applicantSnapshot?.name ??
      raw.name ??
      `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim(),
    email: raw.applicantSnapshot?.email ?? raw.email ?? "",
    course: raw.applicant?.course ?? raw.course ?? "",
    year: raw.applicant?.year ?? raw.year ?? "",
    roleApplied:
      raw.roleApplied ?? raw.position?.title ?? raw.positionTitle ?? "",
    campus: raw.campus ?? "",
    status: raw.status as RecruitmentApplicant["status"],
    resume:
      raw.documents?.resume?.url ??
      raw.documents?.resume?.storageKey ??
      raw.resume ??
      raw.resumeUrl,
    resumeFilename: raw.documents?.resume?.originalFilename,
    aiSummary: raw.aiSummary,
    interviewDate: raw.interview?.scheduledAt ?? raw.interviewDate,
    interviewStart: raw.interviewStart,
    interviewEnd: raw.interviewEnd,
    interviewOfficer: raw.interview?.location ?? raw.interviewOfficer,
    interviewType: raw.interviewType,
  };
}

// createInterview/updateInterview on the backend expect {scheduledAt,
// location, notes} (see InterviewPayload in recruitment.api.ts), not the
// {date, startTime, endTime, officer, interviewType} shape the scheduling
// dialog collects. Combine date + startTime into an ISO string and stash
// the officer/type into notes until there's a dedicated field for them.
function toInterviewPayload(values: ScheduleInterviewValues) {
  return {
    scheduledAt: new Date(`${values.date}T${values.startTime}`).toISOString(),
    location: values.officer,
    notes: `Interview type: ${values.interviewType}; ends ${values.endTime}`,
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
  const [activeTab, setActiveTab] = useState<RecruitmentTab>("applications");

  const [applicants, setApplicants] = useState<RecruitmentApplicant[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<RecruitmentFilters>(DEFAULT_FILTERS);

  const [sort, setSort] = useState<RecruitmentSort>(DEFAULT_SORT);

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [isMutating, setIsMutating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Surfaces failures from approve/reject/schedule actions without
  // clearing already-loaded table data (unlike `error`, which is for the
  // initial fetch and blanks the table on failure).
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

  const downloadResume = useCallback(async (id: string) => {
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getApplicants({});
        const list = res.data.data.applicants;
        if (!cancelled) setApplicants(list.map(mapApplication));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load applicants"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
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

        if (
          filters.years.length > 0 &&
          !filters.years.includes(applicant.year)
        ) {
          return false;
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
    downloadResume,
    isResumeLoading,
    resumeError,
  };
};
