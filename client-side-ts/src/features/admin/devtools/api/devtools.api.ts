import axios from "axios";
import backendConnection from "@/api/backendApi";
import type { EmailQueueEntry, HealthStats, SessionInfo, CronExecutionLog, EnvStatusItem, RateLimitStats, CollectionStat } from "../types/devtools.types";

const getAuthToken = (): string | null => sessionStorage.getItem("Token");

const api = axios.create({
  baseURL: backendConnection(),
});

export const getEmailQueue = async (params?: { status?: string; subtype?: string; limit?: number; skip?: number }) => {
  const { data } = await api.get<{ data: EmailQueueEntry[]; total: number }>("/api/v2/dev/email-queue", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const exportEmailQueueCsv = async (params?: { status?: string; subtype?: string }) => {
  const { data } = await api.get("/api/v2/dev/email-export", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
    responseType: "blob",
  });
  return data;
};

export const resendEmail = async (id: string) => {
  await api.post(`/api/v2/dev/email-resend/${id}`, {}, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
};

export const getHealth = async () => {
  const { data } = await api.get<{ data: HealthStats }>("/api/v2/dev/health", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const getSessions = async (params?: { role?: string; campus?: string }) => {
  const { data } = await api.get<{ data: SessionInfo[] }>("/api/v2/dev/sessions", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const invalidateSession = async (userId: string) => {
  await api.post(
    "/api/v2/dev/sessions/invalidate",
    { userId },
    { headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {} }
  );
};

export const invalidateBulkSessions = async (userIds: string[]) => {
  await api.post(
    "/api/v2/dev/sessions/invalidate-bulk",
    { userIds },
    { headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {} }
  );
};

export const triggerCron = async (type: string) => {
  await api.post(
    "/api/v2/dev/actions/cron",
    { type },
    { headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {} }
  );
};

export const getExpiredOrders = async () => {
  const { data } = await api.get<{ data: any[] }>("/api/v2/dev/expired-orders", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const cancelExpiredOrders = async () => {
  const { data } = await api.post<{ data: { cancelledCount: number; restoredItems: number } }>("/api/v2/dev/actions/cancel-expired", {}, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const getCronStatus = async (jobName?: string, limit = 20) => {
  const { data } = await api.get<{ data: CronExecutionLog[] }>("/api/v2/dev/cron-status", {
    params: { jobName, limit },
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const getEnvStatus = async () => {
  const { data } = await api.get<{ data: EnvStatusItem[] }>("/api/v2/dev/env-status", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const getRateLimitStats = async () => {
  const { data } = await api.get<{ data: RateLimitStats }>("/api/v2/dev/rate-limit-stats", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const getDbPerformance = async () => {
  const { data } = await api.get<{ data: CollectionStat[] }>("/api/v2/dev/db-performance", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const rebuildDbIndexes = async () => {
  const { data } = await api.post<{ message: string; data: string[] }>("/api/v2/dev/db/rebuild-indexes", {}, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};
