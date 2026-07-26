import { Router } from "express";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
import { devtoolsController } from "../controllers/devtools.v2.controller";
import { psits_roles } from "../enums/role.enums";

const router = Router();

// All routes: authenticated admin with PSITS_DEV access
const authChain = [
  requireAccessTokenV2,
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

// Sessions (dangerous operations need DB check)
const sessionAuthChain = [
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.DEVELOPER]),
];

router.get("/sessions", ...authChain, devtoolsController.getSessions);
router.delete(
  "/sessions/expired",
  ...sessionAuthChain,
  devtoolsController.clearExpiredSessions
);
router.post(
  "/sessions/invalidate",
  ...sessionAuthChain,
  devtoolsController.invalidateSession
);
router.post(
  "/sessions/invalidate-bulk",
  ...sessionAuthChain,
  devtoolsController.invalidateBulkSessions
);

// Actions
router.post(
  "/actions/cron",
  ...sessionAuthChain,
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
  ...sessionAuthChain,
  devtoolsController.cancelExpiredOrders
);

// Tester
router.post(
  "/test-endpoint",
  ...sessionAuthChain,
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
  ...sessionAuthChain,
  devtoolsController.rebuildDbIndexes
);

export default router;
