import { Router, Request } from "express";
import { reportController } from "../controllers/report.v2.controller";
import dotenv from "dotenv";
import {
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";
dotenv.config();

const router = Router();

//Fetch reports
router.get(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  reportController.fetchReport
);

export default router;
