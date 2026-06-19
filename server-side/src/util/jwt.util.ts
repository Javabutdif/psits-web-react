import crypto from "crypto";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Safely retrieve required environment variable.
 * Throws if missing, ensuring app fails fast at startup.
 */
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

// JWT secrets and TTLs from env
const ACCESS_TOKEN_SECRET = requireEnv("ACCESS_TOKEN_SECRET");
const REFRESH_TOKEN_SECRET = requireEnv("REFRESH_TOKEN_SECRET");

type ExpiresIn = SignOptions["expiresIn"];

const ACCESS_TOKEN_TTL: ExpiresIn = requireEnv("ACCESS_TOKEN_TTL") as ExpiresIn;
const REFRESH_TOKEN_TTL: ExpiresIn = requireEnv(
  "REFRESH_TOKEN_TTL"
) as ExpiresIn;

/**
 * Base claims included in both access and refresh tokens.
 * Stateless design: role and campus stored in token to avoid DB lookups on protected routes.
 */
type BaseClaims = {
  sub: string; // user ObjectId as string
  idNumber: string; // unique user identifier (e.g., "2024-12345" or "2024-admin-001")
  role: "admin" | "student"; // determines authorization level
  campus: string; // e.g., "UC-Main"; used for filtering/authorization
  pwdChangedAt?: string; // ISO timestamp; token becomes invalid if user changed password after issuance
};

/**
 * Access token: short-lived (15m), sent in Authorization header for API requests.
 * Frontend keeps in memory; never stored in storage.
 */
export type AccessTokenClaims = BaseClaims & {
  tokenType: "access";
};

/**
 * Refresh token: long-lived (7d), stored in httpOnly cookie.
 * Used by frontend to silently refresh access token when it expires.
 */
export type RefreshTokenClaims = BaseClaims & {
  tokenType: "refresh";
  jti: string; // unique token instance id for future rotation/revocation logging
};

/**
 * Type guard to safely check if decoded token is a JwtPayload object (not a string/null).
 */
const isJwtPayload = (
  decoded: string | JwtPayload | null
): decoded is JwtPayload => {
  return typeof decoded === "object" && decoded !== null;
};

/**
 * Sign an access token with the given user claims.
 * @param claims identity and role data
 * @param options optional overrides (e.g., expiresIn for testing)
 * @returns signed access token
 */
export const signAccessToken = (
  claims: BaseClaims,
  options?: SignOptions
): string => {
  return jwt.sign({ ...claims, tokenType: "access" }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
    ...options,
  });
};

/**
 * Sign a refresh token with the given user claims.
 * Automatically generates a unique jti (JWT ID) if not provided for token tracking.
 * @param claims user identity and role data
 * @param options optional overrides
 * @returns signed refresh token
 */
export const signRefreshToken = (
  claims: BaseClaims & { jti?: string },
  options?: SignOptions
): string => {
  const jti = claims.jti ?? crypto.randomUUID();
  return jwt.sign(
    { ...claims, tokenType: "refresh", jti },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL, ...options }
  );
};

/**
 * Verify and decode an access token. Throws on invalid signature, expiry, or wrong type.
 * @param token JWT string
 * @returns decoded access token claims
 * @throws Error if token is invalid or not an access token
 */
export const verifyAccessToken = (token: string): AccessTokenClaims => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (!isJwtPayload(decoded) || decoded.tokenType !== "access") {
      throw new Error("Invalid access token type");
    }

    return decoded as AccessTokenClaims;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    }
    throw error;
  }
};

/**
 * Verify and decode a refresh token. Throws on invalid signature, expiry, or wrong type.
 * @param token JWT string from httpOnly cookie
 * @returns decoded refresh token claims
 * @throws Error if token is invalid or not a refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenClaims => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    if (!isJwtPayload(decoded) || decoded.tokenType !== "refresh") {
      throw new Error("Invalid refresh token type");
    }

    return decoded as RefreshTokenClaims;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};

/**
 * Decode a token without verifying signature (for reading purposes only, dont use for authentication).
 * @param token JWT string
 * @returns decoded payload or null if invalid format
 */
export const decodeToken = (token: string): JwtPayload | null => {
  const decoded = jwt.decode(token);
  return isJwtPayload(decoded) ? decoded : null;
};
