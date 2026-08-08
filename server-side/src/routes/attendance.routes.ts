import { Router } from "express";
import {
  applyEvent,
  scanAttendance,
  markAttendedManually,
  getEventAttendees,
} from "../controllers/attendance.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";

const router = Router();

// Student mo-apply → simple write, pwede stateless token check ra
router.post(
  "/events/:eventId/apply",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  applyEvent
);

// QR scan → admin action nga nag-update og attendance state, gamiton ang DB-checked verification
router.post(
  "/attendance/scan",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  scanAttendance
);

// Manual mark → parehas sensitive, DB-checked pud
router.patch(
  "/attendance/mark-manual",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  markAttendedManually
);

// List attendees → read-only, stateless ra igo
router.get(
  "/events/:eventId/attendees",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getEventAttendees
);

export default router;
