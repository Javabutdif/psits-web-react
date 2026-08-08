import { Router } from "express";
import {
  getContributionsController,
  getContributionController,
  createContributionController,
  updateContributionController,
  deleteContributionController,
  syncDeveloperContributionsController,
  getSyncStatusController,
  setGithubUsernameController,
  getAdminOptionsController,
  searchStudentsController,
} from "../controllers/contribution.v2.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";

const router = Router();

// GET all contributions (optional type filter)
router.get(
  "/",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getContributionsController
);

// GET admin options for contribution form (must precede /:id)
router.get(
  "/admins",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAdminOptionsController
);

// GET student search for contribution form (must precede /:id)
router.get(
  "/students/search",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  searchStudentsController
);

// GET single contribution
router.get(
  "/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getContributionController
);

// POST create contribution (media/volunteer)
router.post(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  createContributionController
);

// PUT update contribution
router.put(
  "/:id",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  updateContributionController
);

// DELETE contribution
router.delete(
  "/:id",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  deleteContributionController
);

// POST sync developer contributions from GitHub
router.post(
  "/github/sync",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["PSITS_DEV", "PSITS_ADMIN"]),
  syncDeveloperContributionsController
);

// GET sync status
router.get(
  "/github/status",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["PSITS_DEV", "PSITS_ADMIN"]),
  getSyncStatusController
);

// PATCH set admin github username
router.patch(
  "/admin/:idNumber/github-username",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["PSITS_DEV", "PSITS_ADMIN"]),
  setGithubUsernameController
);

export default router;