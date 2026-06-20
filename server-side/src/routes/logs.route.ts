import { Router } from "express";
import {
  getAllLogsController,
  addNewLogController,
} from "../controllers/log.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";

const router = Router();

// Fetch all logs
router.get(
  "/",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllLogsController
);

// Add a new log
router.post(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  addNewLogController
);

export default router;
