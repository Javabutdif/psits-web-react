import axios from "axios";
import backendConnection from "@/api/backendApi";
import type { EmailQueueEntry, HealthStats, SessionInfo, CronExecutionLog, EnvStatusItem, RateLimitStats, CollectionStat, LogQueryParams, LogsResponse, OrderDetail, OrderSearchParams, OrdersResponse, AdminSearchParams, AdminsResponse, StudentSearchParams, StudentsResponse } from "../types/devtools.types";

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

export const getLogs = async (params?: LogQueryParams) => {
  const { data } = await api.get<LogsResponse>("/api/v2/dev/logs", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const deleteOldLogs = async (days: number) => {
  const { data } = await api.delete<{ message: string; deletedCount: number }>("/api/v2/dev/logs/old", {
    params: { days },
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const getOrders = async (params?: OrderSearchParams) => {
  const { data } = await api.get<OrdersResponse>("/api/v2/dev/orders", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const getOrderDetails = async (id: string) => {
  const { data } = await api.get<{ data: OrderDetail }>(`/api/v2/dev/orders/${id}`, {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const searchAdmins = async (params?: AdminSearchParams) => {
  const { data } = await api.get<AdminsResponse>("/api/v2/dev/admins/search", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const searchStudents = async (params?: StudentSearchParams) => {
  const { data } = await api.get<StudentsResponse>("/api/v2/dev/students/search", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data;
};

export const getCertificateTemplates = async () => {
  const { data } = await api.get<{ data: import("../types/devtools.types").CertificateTemplate[] }>("/api/v2/dev/certificates", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const exportCollection = async (params: { collection: string; fields?: string }) => {
  const { data } = await api.get("/api/v2/dev/export", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
    responseType: "blob",
  });
  return data;
};

export const getMembershipRevenue = async () => {
  const { data } = await api.get<{ data: { month: number; year: number; total: number; count: number }[] }>("/api/v2/dev/membership-revenue", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const getStockAlerts = async (threshold?: number) => {
  const { data } = await api.get<{ data: { _id: string; name: string; stocks: number; price: number; is_active: boolean; category: string; warning: string }[] }>("/api/v2/dev/stock-alerts", {
    params: threshold ? { threshold } : undefined,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const getSystemSettings = async () => {
  const { data } = await api.get<{ data: { membership_price: number } | null }>("/api/v2/dev/settings", {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};

export const getRateLimitViolations = async (limit = 50) => {
  const { data } = await api.get<{ data: { ip: string; path: string; timestamp: string }[] }>("/api/v2/dev/rate-limit-violations", {
    params: { limit },
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
};
