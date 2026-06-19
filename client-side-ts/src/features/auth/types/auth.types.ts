export type Campus = "UC-Main" | "UC-Banilad" | "UC-LM" | "UC-PT" | "UC-CS";

/** User object returned by the backend on login/refresh. */
export type User = {
  id: string;
  idNumber: string;
  role: "admin" | "student";
  campus: Campus;
  name?: string;
  email?: string;
  course?: string;
  year?: number | string;
  membershipStatus?: string;
  /** Admin-only fields */
  position?: string;
  access?: string;
};

/** Shape of a successful login / refresh response. */
export type AuthResponse = {
  message: string;
  accessToken: string;
  user: User;
};

/** Credentials sent to POST /api/v2/auth/login. */
export type LoginPayload = {
  id_number: string;
  password: string;
};

/** Global auth state managed by AuthContext. */
export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
