export type RecruitmentTab =
  | "applications"
  | "verification"
  | "interviews"
  | "approved";

export type RecruitmentSortField =
  | "name"
  | "id_number"
  | "courseYear"
  | "roleApplied"
  | "status";

export type RecruitmentAction =
  | "approve"
  | "reject"
  | "verify"
  | "schedule"
  | "complete";

export type RecruitmentStatus =
  | "Pending"
  | "For Verification"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Approved"
  | "Rejected";

export interface RecruitmentApplicant {
  id: string;
  id_number: string;
  name: string;
  email: string;
  course: string;
  year: string;
  roleApplied: string;
  campus: string;
  status: RecruitmentStatus;
  resume?: string;
  aiSummary?: string;
  interviewDate?: string;
  interviewStart?: string;
  interviewEnd?: string;
  interviewOfficer?: string;
  interviewType?: string;
  resumeFilename?: string;
}

export interface RecruitmentFilters {
  roles: string[];

  courses: string[];

  years: string[];

  status: string;
}

export interface RecruitmentSort {
  field: RecruitmentSortField;

  direction: "asc" | "desc";
}

export interface ScheduleInterviewValues {
  date: string;

  startTime: string;

  endTime: string;

  officer: string;

  interviewType: string;
}

export interface OpenRecruitmentValues {
  startDate: string;

  endDate: string;

  startTime: string;

  endTime: string;

  roles: string[];
}
