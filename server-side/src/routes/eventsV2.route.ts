import { Router } from "express";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";

import {
  addAttendeeV2Controller,
  changeAttendeePasswordV2Controller,
  drawEventRaffleWinnerController,
  editAttendeeV2Controller,
  getAllEventsV2Controller,
  getEditableAttendeeV2Controller,
  getEligibleAttendeesRaffleV2Controller,
  getEventAttendeesV2Controller,
  getEventByIdV2Controller,
  getEventStatisticsV2Controller,
  getMyEventsController,
  markAttendanceV2Controller,
  undoEventRaffleWinnerController,
} from "../controllers/eventV2.controller";

const router = Router();

// GET all events
router.get(
  "/get-all-event",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  getAllEventsV2Controller
);

// GET all events the student is attended in,
// with their attendance record filtered per event
router.get(
  "/my-events",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  getMyEventsController
);

// GET specific event
router.get(
  "/:eventId",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  getEventByIdV2Controller
);

// GET paginated attendees for specific event
router.get(
  "/:eventId/attendees",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getEventAttendeesV2Controller
);

// GET statistics for specific event
router.get(
  "/:eventId/statistics",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getEventStatisticsV2Controller
);

// POST add attendee (creates user account if needed + registers as attendee)
router.post(
  "/:eventId/attendees",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  addAttendeeV2Controller
);

// PUT mark attendance for a specific attendee in an event
router.put(
  "/:eventId/attendance/:idNumber",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  markAttendanceV2Controller
);

// GET editable attendee data (includes student name components)
router.get(
  "/:eventId/attendees/:idNumber/editable",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  getEditableAttendeeV2Controller
);

// PUT edit attendee details
router.put(
  "/:eventId/attendees/:idNumber",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  editAttendeeV2Controller
);

// PUT change attendee password
router.put(
  "/:eventId/attendees/:idNumber/password",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  changeAttendeePasswordV2Controller
);

// GET eligible raffle participants
router.get(
  "/raffle/:eventId/",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getEligibleAttendeesRaffleV2Controller
);

// POST draw raffle winner
router.post(
  "/raffle/:eventId/draw",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  drawEventRaffleWinnerController
);

// POST undo raffle winner
router.post(
  "/raffle/:eventId/undo/:attendeeId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  undoEventRaffleWinnerController
);
export default router;
