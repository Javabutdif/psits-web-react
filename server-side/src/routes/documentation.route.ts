import { Router } from "express";
import {
  getApiEndpoints,
  getApiEndpointById,
  getFeatures,
  getFeatureById,
  getDocStats,
  getFeatureCategories,
  getApiMethods,
  createApiEndpoint,
  createFeature,
  updateApiEndpoint,
  deleteApiEndpoint,
  updateFeature,
  deleteFeature,
  toggleEndpointStatus,
  toggleFeatureStatus,
} from "../controllers/documentation.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";

const router = Router();

// Public routes (no authentication required)
router.get("/stats", getDocStats);
router.get("/feature-categories", getFeatureCategories);
router.get("/api-methods", getApiMethods);

// Protected routes (authentication required for admins only)
router.get(
  "/endpoints",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getApiEndpoints
);
router.get(
  "/endpoints/:endpointId",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getApiEndpointById
);
router.get(
  "/features",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getFeatures
);
router.get(
  "/features/:featureId",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getFeatureById
);

// Admin-only routes (admin role required)
router.post(
  "/endpoints",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  createApiEndpoint
);
router.post(
  "/features",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  createFeature
);

// Update routes
router.put(
  "/endpoints/:endpointId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  updateApiEndpoint
);
router.put(
  "/features/:featureId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  updateFeature
);

// Delete routes (soft delete)
router.delete(
  "/endpoints/:endpointId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  deleteApiEndpoint
);
router.delete(
  "/features/:featureId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  deleteFeature
);

// Toggle status routes
router.patch(
  "/endpoints/:endpointId/toggle",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  toggleEndpointStatus
);
router.patch(
  "/features/:featureId/toggle",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  toggleFeatureStatus
);

export default router;
