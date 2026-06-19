import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { Student } from "../models/student.model";
import { IStudentDocument } from "../models/student.interface";
import { Admin } from "../models/admin.model";
import { IAdminDocument } from "../models/admin.interface";
import { signAccessToken, signRefreshToken } from "../util/jwt.util";
import {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshTokenFromCookie,
} from "../util/cookie.util";
import { verifyRefreshToken } from "../util/jwt.util";
import { Log } from "../models/log.model";
import { AuthError, AuthErrorCodes } from "../util/errors.util";

/**
 * Shared user response type for frontend
 */
type UserResponse = {
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

/**
 * Convert Student/Admin model to UserResponse
 */
const toUserResponse = (
  user: IStudentDocument | IAdminDocument,
  role: "admin" | "student"
): UserResponse => {
  if (role === "student") {
    const student = user as IStudentDocument;
    return {
      id: student._id.toString(),
      idNumber: student.id_number,
      role: "student",
      campus: student.campus,
      name: `${student.first_name} ${student.middle_name || ""} ${
        student.last_name
      }`.trim(),
      email: student.email,
      course: student.course,
      year: student.year,
      membershipStatus: student.membershipStatus,
    };
  } else {
    const admin = user as IAdminDocument;
    return {
      id: admin._id.toString(),
      idNumber: admin.id_number,
      role: "admin",
      campus: admin.campus || "UC-Main",
      name: admin.name,
      email: admin.email,
      course: admin.course,
      year: admin.year,
      position: admin.position,
      access: admin.access,
    };
  }
};

/**
 * POST /v2/auth/login
 * Validates credentials, issues access + refresh tokens, sets refresh cookie.
 */
export const loginV2Controller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id_number, password } = req.body;

  console.log(`Login attempt for ID: ${id_number}`);
  try {
    let user: IAdminDocument | IStudentDocument | null = null;
    let  role: "admin" | "student";

    // Check if admin login (id_number contains "-admin")
    if (id_number.includes("-admin")) {
      const admin = await Admin.findOne({ id_number });
      if (!admin) {
        throw new AuthError(AuthErrorCodes.InvalidCredentials);
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        throw new AuthError(AuthErrorCodes.InvalidCredentials);
      }

      if (admin.status === "Suspend") {
        throw new AuthError(AuthErrorCodes.AccountSuspended);
      }

      if (admin.status !== "Active") {
        throw new AuthError(AuthErrorCodes.AccountNotActive);
      }

      user = admin;
      role = "admin";

      // Log admin login
      const log = new Log({
        admin: admin.name,
        admin_id: String(admin._id),
        action: "Admin Login (v2)",
      });
      await log.save();
    } else {
      // Student login
      const student = await Student.findOne({ id_number });
      if (!student) {
        throw new AuthError(AuthErrorCodes.InvalidCredentials);
      }

      const passwordMatch = await bcrypt.compare(password, student.password);
      if (!passwordMatch) {
        throw new AuthError(AuthErrorCodes.InvalidCredentials);
      }

      if (student.status === "False") {
        throw new AuthError(AuthErrorCodes.AccountDeleted);
      }

      if (student.status !== "True") {
        throw new AuthError(AuthErrorCodes.AccountNotActive);
      }

      user = student;
      role = "student";
    }

    // Sign tokens
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      idNumber: user.id_number,
      role,
      campus: user.campus || "UC-Main",
    });

    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      idNumber: user.id_number,
      role,
      campus: user.campus || "UC-Main",
    });

    // Save refresh token to database for rotation validation
    if (role === "admin") {
      await Admin.findByIdAndUpdate(user._id, {
        currentRefreshToken: refreshToken,
      });
    } else {
      await Student.findByIdAndUpdate(user._id, {
        currentRefreshToken: refreshToken,
      });
    }

    // Set refresh token in httpOnly cookie
    setRefreshCookie(res, refreshToken);

    // Return access token and user data
    return res.status(200).json({
      message: "Signed in successfully",
      accessToken,
      user: toUserResponse(user, role),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v2/auth/refresh
 * Reads refresh token from cookie, verifies it, checks for reuse (theft detection), issues new tokens.
 * Implements refresh token rotation: old token is invalidated upon successful refresh.
 */
export const refreshV2Controller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = getRefreshTokenFromCookie(req.headers.cookie);

    if (!refreshToken) {
      throw new AuthError(AuthErrorCodes.TokenNotFound);
    }

    // Verify refresh token signature
    let claims;
    try {
      claims = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AuthError(AuthErrorCodes.InvalidToken);
    }

    // Fetch user from DB to check if token matches stored currentRefreshToken
    let user: IStudentDocument | IAdminDocument | null = null;
    let role: "admin" | "student" = claims.role;

    if (role === "admin") {
      user = await Admin.findById(claims.sub);
    } else {
      user = await Student.findById(claims.sub);
    }

    // Explicitly check if user exists first.
    if (!user) {
      clearRefreshCookie(res);
      throw new AuthError(AuthErrorCodes.AccountNoLongerActive);
    }

    const isAccountActive =
      role === "admin" ? user.status === "Active" : user.status === "True";

    if (!isAccountActive) {
      clearRefreshCookie(res);
      throw new AuthError(AuthErrorCodes.AccountNoLongerActive);
    }

    // CRITICAL: Verify refresh token matches the stored token (rotation check)
    if (user.currentRefreshToken !== refreshToken) {
      // Invalidate all sessions for this user by setting currentRefreshToken to null
      if (role === "admin") {
        await Admin.findByIdAndUpdate(claims.sub, {
          currentRefreshToken: null,
        });
      } else {
        await Student.findByIdAndUpdate(claims.sub, {
          currentRefreshToken: null,
        });
      }

      clearRefreshCookie(res);
      console.warn(
        `Refresh token reuse detected for user ${claims.idNumber} (${role}). All sessions invalidated.`
      );
      throw new AuthError(AuthErrorCodes.TokenInvalidated);
    }

    // Generate new tokens (rotation)
    const newAccessToken = signAccessToken({
      sub: user._id.toString(),
      idNumber: user.id_number,
      role,
      campus: user.campus || "UC-Main",
    });

    const newRefreshToken = signRefreshToken({
      sub: user._id.toString(),
      idNumber: user.id_number,
      role,
      campus: user.campus || "UC-Main",
    });

    // Update database with new refresh token (invalidate old one)
    if (role === "admin") {
      await Admin.findByIdAndUpdate(claims.sub, {
        currentRefreshToken: newRefreshToken,
      });
    } else {
      await Student.findByIdAndUpdate(claims.sub, {
        currentRefreshToken: newRefreshToken,
      });
    }

    // Set new refresh token in cookie
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      user: toUserResponse(user, role),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v2/auth/logout
 * Clears refresh token cookie and invalidates stored token in database.
 * This ensures the token can never be reused, even if it's stolen.
 */
export const logoutV2Controller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = getRefreshTokenFromCookie(req.headers.cookie);

    // If a valid refresh token exists, invalidate it in the database
    if (refreshToken) {
      try {
        const claims = verifyRefreshToken(refreshToken);

        if (claims.role === "admin") {
          await Admin.findByIdAndUpdate(claims.sub, {
            currentRefreshToken: null,
          });
        } else {
          await Student.findByIdAndUpdate(claims.sub, {
            currentRefreshToken: null,
          });
        }
      } catch (error) {
        // Token might be expired or invalid, but we still clear the cookie
        console.debug("Could not verify token during logout:", error);
      }
    }

    clearRefreshCookie(res);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
