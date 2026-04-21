import { Router } from "express";
import {
  loginV2Controller,
  refreshV2Controller,
  logoutV2Controller,
} from "../controllers/authV2.controller";

const router: Router = Router();

/**
 * POST /v2/auth/login
 * Authenticate user with id_number + password, issue tokens, set refresh cookie
 */
router.post("/login", loginV2Controller);

/**
 * POST /v2/auth/refresh
 * Read refresh token from cookie, validate, issue new tokens
 */
router.post("/refresh", refreshV2Controller);

/**
 * POST /v2/auth/logout
 * Clear refresh token cookie (stateless; token remains valid until expiry)
 */
router.post("/logout", logoutV2Controller);

export default router;
