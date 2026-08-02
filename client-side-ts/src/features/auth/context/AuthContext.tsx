import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, LoginPayload } from "../types/auth.types";
import { loginUser, logoutUser, refreshTokens } from "../api/auth.api";
import { clearAccessToken } from "../utils/tokenStore";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";

export type { AuthContextValue };

// ── Provider ────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until silent refresh resolves

  // ── Silent refresh on mount ─────────────────────────────────────────
  // If the browser still has a valid httpOnly refresh cookie, restore the
  // session without forcing the user to log in again.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const result = await refreshTokens();
        if (!cancelled && result) {
          setUser(result.user);
        }
      } catch {
        // No valid session — user will need to log in
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await loginUser(payload);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    clearAccessToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await refreshTokens();
    if (result) {
      setUser(result.user);
      return result.user;
    }

    // A failed refresh must not destroy an active session. Session loss is
    // only definitive at boot (restoreSession) or when a real API request
    // 401s; an opportunistic refresh failure (e.g. token rotation race
    // between tabs) should not force-log the user out.
    return null;
  }, []);

  // ── Memoized context value ──────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
