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
const ACCESS_TOKEN_STORAGE_KEY = "recruitmentAccessToken";

type AuthUserResponse = {
  id: string;
  idNumber: string;
  role: "admin" | "student";
  campus: string;
  name?: string;
  email?: string;
  course?: string;
  year?: number | string;
  membershipStatus?: string;
  position?: string;
  access?: string;
};

type RefreshResponse = {
  accessToken: string;
  user: AuthUserResponse;
};

// ── API Instance ────────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true, // Send cookies for auth (refresh token)
  headers: { "Content-Type": "application/json" },
});

// ── Token Storage ───────────────────────────────────────────────────────────────
export function setRecruitmentAccessToken(token: string) {
  recruitmentWindow.recruitmentAccessToken = token;
  window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function getRecruitmentAccessToken(): string | null {
  return (
    recruitmentWindow.recruitmentAccessToken ||
    window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  );
}

export function clearRecruitmentToken() {
  recruitmentWindow.recruitmentAccessToken = null;
  window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

// ── Refresh Token Logic ────────────────────────────────────────────────────────
let inflightRefresh: Promise<RefreshResponse | null> | null = null;

/**
 * Attempt to refresh access token using the httpOnly refresh cookie.
 * Returns true if successful, false otherwise.
 */
export const refreshAccessToken = async (): Promise<RefreshResponse | null> => {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = (async () => {
    try {
      const response = await api.post<RefreshResponse>("/v2/auth/refresh");

      const newToken = response.data.accessToken;
      if (newToken) {
        setRecruitmentAccessToken(newToken);
        return response.data;
      }
      return null;
    } catch {
      // Clear any stale token
      clearRecruitmentToken();
      return null;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

// ── Request Interceptor ─────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getRecruitmentAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data as
      | { message?: string }
      | undefined;
    const errorMessage =
      responseData?.message || error.message || "An unexpected error occurred";

    // Skip refresh flow for the refresh endpoint itself (avoid deadlock)
    const isRefreshRequest = error.config?.url?.includes("/v2/auth/refresh");
    if (isRefreshRequest) {
      clearRecruitmentToken();
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - attempt refresh before redirecting
    if (status === 401) {
      // Don't retry if we're already refreshing (prevent race conditions)
      if (!inflightRefresh) {
        return refreshAccessToken().then((refreshResult) => {
          if (refreshResult) {
            // Retry the original request with fresh token
            const config = error.config;
            if (config) {
              const token = getRecruitmentAccessToken();
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
              return api(config);
            }
          } else {
            // Refresh failed or no longer applicable - redirect to login
            clearRecruitmentToken();
            window.location.href = "/login";
          }
          return Promise.reject(error);
        });
      }

      // Wait for existing refresh to complete, then check status
      return inflightRefresh
        .then((refreshResult) => {
          if (!refreshResult) {
            clearRecruitmentToken();
            window.location.href = "/login";
          }
          // Retry the request once refresh is done
          const config = error.config;
          if (config) {
            const token = getRecruitmentAccessToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return api(config);
          }
        })
        .catch(() => {
          clearRecruitmentToken();
          window.location.href = "/login";
          return Promise.reject(error);
        });
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

export default api;
