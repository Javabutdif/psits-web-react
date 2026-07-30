import api from "@/api/axios";
import axios, { AxiosError } from "axios";
import type {
  CertificateTemplatesResponse,
  CreateTemplatePayload,
  EventsWithCertificateResponse,
  AttendeeRaw,
  PaginatedListResult,
  AssetTreeNode,
} from "../types/certificate.types";

interface ApiErrorResponse {
  message?: string;
}

const handleApiError = (error: unknown, logError = true): void => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (logError) {
      console.error(
        "Certificate API Error:",
        axiosError.response?.data?.message || axiosError.message || "An error occurred"
      );
    }
  } else {
    console.error("Certificate API Error:", error);
  }
};

const BASE_URL = "/api/v2/certificates";

export const getActiveTemplates = async (): Promise<CertificateTemplatesResponse> => {
  const response = await api.get(`${BASE_URL}/templates`);
  return response.data;
};

export const createTemplate = async (
  payload: CreateTemplatePayload
): Promise<any> => {
  const response = await api.post(`${BASE_URL}/templates`, payload);
  return response.data;
};

export const updateTemplate = async (
  templateId: string,
  payload: Partial<CreateTemplatePayload>
): Promise<any> => {
  const response = await api.patch(`${BASE_URL}/templates/${templateId}`, payload);
  return response.data;
};

export const getEventsWithCertificates = async (): Promise<EventsWithCertificateResponse> => {
  const response = await api.get(`${BASE_URL}/events`);
  return response.data;
};

export const configureEventCertificate = async (
  eventId: string,
  templateId: string,
  isGenerateCertificate: boolean = true
): Promise<any> => {
  try {
    const response = await api.patch(
      `/api/v2/certificates/${eventId}/configure`,
      { templateId, isGenerateCertificate }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, true);
    return null;
  }
};

export const getEventAttendeesRaw = async (
  eventId: string,
  pageNumber: number = 1,
  pageSize: number = 50,
  searchQuery: string = "",
  sortBy: string = "",
  sortOrder: "asc" | "desc" = "asc"
): Promise<PaginatedListResult<AttendeeRaw> | null> => {
  try {
    const response = await api.get(`/api/v2/certificates/${eventId}/attendees-raw`, {
      params: {
        pageNumber,
        pageSize,
        search: searchQuery,
        sortBy,
        sortOrder,
      },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error, true);
    return null;
  }
};

export const getTemplatePreview = async (templateId: string): Promise<Blob> => {
  const response = await api.get(`${BASE_URL}/templates/${templateId}/preview`, {
    responseType: "arraybuffer",
  });
  return new Blob([response.data], { type: "application/pdf" });
};

export const getAssetFileTree = async (filter?: string): Promise<AssetTreeNode[]> => {
  try {
    const response = await api.get(`${BASE_URL}/assets-tree`, {
      params: filter ? { filter } : {},
    });
    return response.data.data || [];
  } catch (error) {
    handleApiError(error, true);
    return [];
  }
};

export const updateStudentEligibility = async (
  eventId: string,
  studentIds: string[],
  isEligible: boolean
): Promise<string[] | null> => {
  try {
    const response = await api.patch(`${BASE_URL}/${eventId}/eligibility`, {
      studentIds,
      isEligible,
    });
    return response.data.eligibleStudentsForCertificate;
  } catch (error) {
    handleApiError(error, true);
    return null;
  }
};

export const uploadEligibilityFile = async (
  eventId: string,
  file: File
): Promise<{
  success: boolean;
  results: {
    studentId: string;
    name: string;
    isAttendee: boolean;
    status: string;
  }[];
} | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/api/v2/certificates/${eventId}/eligibility/csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, true);
    return null;
  }
};

