// src/api/client.ts

import axios from "axios";
import { toast } from "sonner";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

type RecruitmentWindow = Window & {
  recruitmentAccessToken?: string | null;
};

const recruitmentWindow = window as RecruitmentWindow;

// ── API Instance ────────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true, // Send cookies for auth
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor ──────────────────────────────────────────────────────────
// Attach Bearer access token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = recruitmentWindow.recruitmentAccessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data as
      | { message?: string }
      | undefined;
    const errorMessage =
      responseData?.message || error.message || "An unexpected error occurred";

    // 401 Unauthorized - redirect to login
    if (status === 401) {
      recruitmentWindow.recruitmentAccessToken = null;
      window.location.href = "/login";
      return Promise.reject(new Error("Unauthorized"));
    }

    // Client/server errors - show toast
    if (status !== undefined && status >= 400 && status < 500) {
      toast.error(errorMessage);
    } else if (status !== undefined && status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

// ── Token Storage ───────────────────────────────────────────────────────────────
// Store token in window object (module-level memory, not localStorage) for auth flow
export function setRecruitmentAccessToken(token: string) {
  recruitmentWindow.recruitmentAccessToken = token;
}

export function getRecruitmentAccessToken(): string | null {
  return recruitmentWindow.recruitmentAccessToken || null;
}

export function clearRecruitmentToken() {
  recruitmentWindow.recruitmentAccessToken = null;
}

export default api;
