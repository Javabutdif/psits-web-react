import { Router } from "express";
import {
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
import { devtoolsController } from "../controllers/devtools.v2.controller";
import { psits_roles } from "../enums/role.enums";

const router = Router();

// All routes: DB-checked admin with PSITS_ADMIN or PSITS_DEV access, campus=MAIN
const authChain = [
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.DEVELOPER]),
];

// Email queue
router.get("/email-queue", ...authChain, devtoolsController.getEmailQueue);
router.post(
  "/email-resend/:id",
  ...authChain,
  devtoolsController.resendSingleEmail
);
router.get(
  "/email-export",
  ...authChain,
  devtoolsController.exportEmailQueueCsv
);

// Health
router.get("/health", ...authChain, devtoolsController.getHealth);

// Sessions
router.get("/sessions", ...authChain, devtoolsController.getSessions);
router.delete(
  "/sessions/expired",
  ...authChain,
  devtoolsController.clearExpiredSessions
);
router.post(
  "/sessions/invalidate",
  ...authChain,
  devtoolsController.invalidateSession
);
router.post(
  "/sessions/invalidate-bulk",
  ...authChain,
  devtoolsController.invalidateBulkSessions
);

// Actions
router.post(
  "/actions/cron",
  ...authChain,
  devtoolsController.triggerCron
);

// Expired orders
router.get(
  "/expired-orders",
  ...authChain,
  devtoolsController.getExpiredOrders
);
router.post(
  "/actions/cancel-expired",
  ...authChain,
  devtoolsController.cancelExpiredOrders
);

// Tester
router.post(
  "/test-endpoint",
  ...authChain,
  devtoolsController.testEndpoint
);

// Cron monitor
router.get(
  "/cron-status",
  ...authChain,
  devtoolsController.getCronStatus
);

// Env inspector
router.get(
  "/env-status",
  ...authChain,
  devtoolsController.getEnvStatus
);

// Rate limiter
router.get(
  "/rate-limit-stats",
  ...authChain,
  devtoolsController.getRateLimitStats
);

// DB performance
router.get(
  "/db-performance",
  ...authChain,
  devtoolsController.getDbPerformance
);
router.post(
  "/db/rebuild-indexes",
  ...authChain,
  devtoolsController.rebuildDbIndexes
);

// Activity logs
router.get(
  "/logs",
  ...authChain,
  devtoolsController.getLogs
);
router.delete(
  "/logs/old",
  ...authChain,
  devtoolsController.deleteOldLogs
);

// Order Manager
router.get(
  "/orders",
  ...authChain,
  devtoolsController.getOrders
);
router.get(
  "/orders/:id",
  ...authChain,
  devtoolsController.getOrderDetails
);

// Admin Lookup
router.get(
  "/admins/search",
  ...authChain,
  devtoolsController.searchAdmins
);

// Student Lookup
router.get(
  "/students/search",
  ...authChain,
  devtoolsController.searchStudents
);

// Certificate Templates
router.get(
  "/certificates",
  ...authChain,
  devtoolsController.getCertificateTemplates
);

// Data Export
router.get(
  "/export",
  ...authChain,
  devtoolsController.exportCollection
);

// Membership Revenue
router.get(
  "/membership-revenue",
  ...authChain,
  devtoolsController.getMembershipRevenue
);

// Stock Alerts
router.get(
  "/stock-alerts",
  ...authChain,
  devtoolsController.getStockAlerts
);

// System Settings
router.get(
  "/settings",
  ...authChain,
  devtoolsController.getSystemSettings
);

// Rate Limit Violations
router.get(
  "/rate-limit-violations",
  ...authChain,
  devtoolsController.getRateLimitViolations
);

export default router;
