import axios from "axios";
import backendConnection from "@/api/backendApi";
import type { AuthResponse, LoginPayload } from "../types/auth.types";
import { setAccessToken, clearAccessToken } from "../utils/tokenStore";

/**
 * Raw API calls for V2 authentication.
 *
 * IMPORTANT: These functions use a plain axios instance with `withCredentials`
 * instead of the shared `api` instance to avoid circular dependency issues
 * (the shared instance imports tokenStore, and refreshTokens is imported by
 * the shared instance's interceptor).
 */

const authAxios = axios.create({
  baseURL: backendConnection(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type LegacyLoginResponse = {
  role: string;
  campus: string;
  token: string;
  message: string;
};

const syncLegacySessionToken = async (payload: LoginPayload): Promise<void> => {
  try {
    const { data } = await authAxios.post<LegacyLoginResponse>(
      "/api/login",
      payload
    );
    // V2 login now also handles /api/login, which returns { accessToken, user }
    // (not the old { token, role, campus } shape). Try both shapes.
    const legacyToken =
      (data as Record<string, unknown>).token ||
      (data as Record<string, unknown>).accessToken;
    if (legacyToken) {
      sessionStorage.setItem("Token", String(legacyToken));
    }
  } catch {
    // Legacy sync is best-effort; don't block login if it fails
  }
};

/**
 * POST /api/v2/auth/login
 *
 * Sends credentials, receives access token + user data.
 * The refresh token is set as an httpOnly cookie by the backend.
 */
export const loginUser = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const { data } = await authAxios.post<AuthResponse>(
    "/api/v2/auth/login",
    payload
  );
  setAccessToken(data.accessToken);
  console.log(data);
  try {
    await syncLegacySessionToken(payload);
  } catch (error) {
    clearAccessToken();
    sessionStorage.removeItem("Token");
    throw error;
  }

  return data;
};

/**
 * POST /api/v2/auth/refresh
 *
 * Sends the httpOnly refresh cookie (automatically by the browser).
 * Receives a new access token + user data (token rotation).
 *
 * Returns `null` when the refresh token is missing or invalid
 * (user must log in again).
 *
 * IMPORTANT: This function de-duplicates concurrent calls. Because refresh
 * token rotation invalidates the old token on first use, a second concurrent
 * call would send the now-stale token and trigger theft detection on the
 * server. By returning the same in-flight promise, we guarantee only ONE
 * HTTP request is made at a time, no matter how many callers invoke this
 * (AuthProvider silent refresh, Axios 401 interceptor, etc.).
 */
let inflightRefresh: Promise<AuthResponse | null> | null = null;

export const refreshTokens = (): Promise<AuthResponse | null> => {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = authAxios
    .post<AuthResponse>("/api/v2/auth/refresh")
    .then(({ data }) => {
      setAccessToken(data.accessToken);
      return data;
    })
    .catch(() => {
      clearAccessToken();
      return null;
    })
    .finally(() => {
      inflightRefresh = null;
    });

  return inflightRefresh;
};

/**
 * POST /api/v2/auth/logout
 *
 * Clears the httpOnly cookie on the server side and invalidates
 * the stored refresh token in the database.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await authAxios.post("/api/v2/auth/logout");
  } finally {
    clearAccessToken();
    sessionStorage.removeItem("Token");
  }
};
