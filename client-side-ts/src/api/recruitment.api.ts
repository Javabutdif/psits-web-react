import api from "./client";
import type {
  ApplicantFilters,
  Application,
  RecruitmentPosition,
} from "../types/recruitment";

// Base path for recruitment routes — matches your existing /api/v2 pattern
const BASE_PATH = "/v2/recruitment";

type PositionListParams = {
  search?: string;
  page?: number;
  limit?: number;
  status?: RecruitmentPosition["hiringStatus"];
};

type ApplicationPayload = FormData;

type PositionPayload = Partial<
  Pick<
    RecruitmentPosition,
    | "title"
    | "description"
    | "responsibilities"
    | "requirements"
    | "hiringStatus"
    | "isActive"
    | "applicationDeadline"
    | "sortOrder"
    | "slots"
  >
>;

type StatusUpdatePayload = {
  status: Application["status"];
  note?: string;
};

type InterviewPayload = {
  scheduledAt: string;
  location: string;
  notes?: string;
};

// ── Public endpoints ────────────────────────────────────────────────────
export const listPositions = (params: PositionListParams) =>
  api.get(`${BASE_PATH}/positions`, { params });

export const getPositionById = (id: string) =>
  api.get(`${BASE_PATH}/positions/${id}`);

// ── Student endpoints ───────────────────────────────────────────────────
export const submitApplication = (
  positionId: string,
  formData: ApplicationPayload
) =>
  api.post(`${BASE_PATH}/positions/${positionId}/applications`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getApplicationsForUser = () =>
  api.get(`${BASE_PATH}/applications/me`);

export const getApplicationForUser = (id: string) =>
  api.get(`${BASE_PATH}/applications/me/${id}`);

// ── Admin endpoints ─────────────────────────────────────────────────────
export const createPosition = (data: PositionPayload) =>
  api.post(`${BASE_PATH}/positions`, data);

export const createOpening = (data: {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  roles: unknown[];
  roleRequirements: string;
}) => api.post(`${BASE_PATH}/positions/bulk-open`, data);

export const updatePosition = (id: string, data: PositionPayload) =>
  api.patch(`${BASE_PATH}/positions/${id}`, data);

export const toggleHiringStatus = (id: string, status: string) =>
  api.patch(`${BASE_PATH}/positions/${id}/hiring-status`, { status });

export const deletePosition = (id: string) =>
  api.delete(`${BASE_PATH}/positions/${id}`);

export const getApplicants = (params: ApplicantFilters) =>
  api.get(`${BASE_PATH}/applicants`, { params });

export const getApplicationDetails = (id: string) =>
  api.get(`${BASE_PATH}/applications/${id}`);

export const getResumeUrl = (applicationId: string) =>
  api.get(`${BASE_PATH}/applications/${applicationId}/resume-url`);

export const downloadResumeFile = (applicationId: string) =>
  api.get(`${BASE_PATH}/applications/${applicationId}/resume`, {
    responseType: "blob",
  });

export const updateApplicationStatus = (
  id: string,
  data: StatusUpdatePayload
) => api.patch(`${BASE_PATH}/applications/${id}/status`, data);

export const createInterview = (
  applicationId: string,
  data: InterviewPayload
) => api.post(`${BASE_PATH}/applications/${applicationId}/interview`, data);

export const updateInterview = (
  applicationId: string,
  data: InterviewPayload
) => api.patch(`${BASE_PATH}/applications/${applicationId}/interview`, data);

export const cancelInterview = (applicationId: string) =>
  api.delete(`${BASE_PATH}/applications/${applicationId}/interview`);

export const verifyApplicantAccount = (id: string) =>
  api.post(`/recruitment/applications/${id}/verify`);
