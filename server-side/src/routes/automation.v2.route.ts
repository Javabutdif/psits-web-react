import { Router } from "express";
import {
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
import { automationController } from "../controllers/automation.v2.controller";
import { psits_roles } from "../enums/role.enums";

const router = Router();

const authChain = [
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN]),
];

// Job CRUD
router.get("/jobs", ...authChain, automationController.getJobs);
router.post("/jobs", ...authChain, automationController.createJob);
router.get("/jobs/:id", ...authChain, automationController.getJob);
router.patch("/jobs/:id", ...authChain, automationController.updateJob);
router.delete("/jobs/:id", ...authChain, automationController.deleteJob);
router.patch("/jobs/:id/toggle", ...authChain, automationController.toggleJob);

// Manual run
router.post("/jobs/:id/run", ...authChain, automationController.runJob);

// Function registry
router.get("/functions", ...authChain, automationController.getFunctions);

// Execution logs
router.get("/jobs/:id/logs", ...authChain, automationController.getExecutionLogs);

export default router;
