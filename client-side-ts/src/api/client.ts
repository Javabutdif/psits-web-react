// src/api/client.ts

import axios from "axios";
import { toast } from "sonner";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken } from "@/features/auth/utils/tokenStore";

// ── API Instance ────────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor ──────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
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

    if (status !== undefined && status >= 400 && status < 500) {
      toast.error(errorMessage);
    } else if (status !== undefined && status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
