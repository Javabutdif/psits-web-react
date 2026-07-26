import axios from "axios";
import backendConnection from "@/api/backendApi";
import type { EmailQueueEntry, HealthStats, SessionInfo } from "../types/devtools.types";

const getAuthToken = (): string | null => sessionStorage.getItem("Token");

const api = axios.create({
  baseURL: backendConnection(),
});

export const getEmailQueue = async (params?: { status?: string; subtype?: string }) => {
  const { data } = await api.get<{ data: EmailQueueEntry[] }>("/api/v2/dev/email-queue", {
    params,
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
  });
  return data.data;
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

export const getSessions = async () => {
  const { data } = await api.get<{ data: SessionInfo[] }>("/api/v2/dev/sessions", {
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
