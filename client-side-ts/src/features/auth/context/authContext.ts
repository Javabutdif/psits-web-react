import { createContext } from "react";
import type { User, LoginPayload } from "../types/auth.types";

/** Shape of values exposed by the AuthContext. */
export type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
