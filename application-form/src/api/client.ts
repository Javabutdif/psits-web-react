// src/api/client.ts

import axios from 'axios';
import { toast } from 'sonner';
import type { AxiosError, AxiosInstance } from 'axios';

// Create API instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send cookies for auth
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from module-level store or cookie
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const responseData = error.response?.data as { message?: string } | undefined;
    const status = error.response?.status;
    const errorMessage = responseData?.message || error.message || 'An unexpected error occurred';
    
    if (status === 401) {
      clearToken();
      window.location.href = '/login';
    } else if (status !== undefined && status >= 400 && status < 500) {
      toast.error(errorMessage);
    } else if (status !== undefined && status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Auth token storage (module-level, not localStorage)
let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearToken() {
  accessToken = null;
}

export default api;
