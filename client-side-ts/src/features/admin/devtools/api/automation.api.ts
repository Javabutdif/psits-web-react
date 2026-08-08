import axios from "axios";
import backendConnection from "@/api/backendApi";
import type {
  AutomationJob,
  ExecuteResult,
  JobsResponse,
  FunctionsResponse,
  LogsResponse,
} from "../types/automation.types";

const getAuthToken = (): string | null => sessionStorage.getItem("Token");

const api = axios.create({
  baseURL: backendConnection(),
});

export const getJobs = async (params?: { isActive?: boolean; limit?: number; skip?: number }) => {
  const { data } = await api.get<JobsResponse>("/api/v2/dev/automation/jobs", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const createJob = async (job: Partial<AutomationJob>) => {
  const { data } = await api.post<{ data: AutomationJob }>("/api/v2/dev/automation/jobs", job, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const getJob = async (id: string) => {
  const { data } = await api.get<{ data: AutomationJob }>(`/api/v2/dev/automation/jobs/${id}`, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const updateJob = async (id: string, job: Partial<AutomationJob>) => {
  const { data } = await api.patch<{ data: AutomationJob }>(`/api/v2/dev/automation/jobs/${id}`, job, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const deleteJob = async (id: string) => {
  const { data } = await api.delete<{ message: string }>(`/api/v2/dev/automation/jobs/${id}`, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const toggleJob = async (id: string) => {
  const { data } = await api.patch<{ data: AutomationJob }>(`/api/v2/dev/automation/jobs/${id}/toggle`, {}, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const runJob = async (id: string) => {
  const { data } = await api.post<{ data: ExecuteResult }>(`/api/v2/dev/automation/jobs/${id}/run`, {}, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const getFunctions = async () => {
  const { data } = await api.get<FunctionsResponse>("/api/v2/dev/automation/functions", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const getJobLogs = async (jobId: string, params?: { limit?: number; skip?: number }) => {
  const { data } = await api.get<LogsResponse>(`/api/v2/dev/automation/jobs/${jobId}/logs`, {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};
