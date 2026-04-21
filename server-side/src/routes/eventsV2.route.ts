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
  roleAuthenticateV2(["Admin", "Student"]),
  getAllEventsV2Controller
);

// GET all events the student is attended in,
// with their attendance record filtered per event
router.get(
  "/my-events",
  requireAccessTokenV2,
  roleAuthenticateV2(["Student"]),
  getMyEventsController
);

// GET specific event
router.get(
  "/:eventId",
  requireAccessTokenV2,
  roleAuthenticateV2(["Admin", "Student"]),
  getEventByIdV2Controller
);

// GET paginated attendees for specific event
router.get(
  "/:eventId/attendees",
  requireAccessTokenV2,
  roleAuthenticateV2(["Admin"]),
  getEventAttendeesV2Controller
);

// GET statistics for specific event
router.get(
  "/:eventId/statistics",
  requireAccessTokenV2,
  roleAuthenticateV2(["Admin"]),
  getEventStatisticsV2Controller
);

// POST add attendee (creates user account if needed + registers as attendee)
router.post(
  "/:eventId/attendees",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["Admin"]),
  addAttendeeV2Controller
);

// PUT mark attendance for a specific attendee in an event
router.put(
  "/:eventId/attendance/:idNumber",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["Admin"]),
  markAttendanceV2Controller
);

// GET editable attendee data (includes student name components)
router.get(
  "/:eventId/attendees/:idNumber/editable",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["Admin"]),
  getEditableAttendeeV2Controller
);

// PUT edit attendee details
router.put(
  "/:eventId/attendees/:idNumber",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["Admin"]),
  editAttendeeV2Controller
);

// PUT change attendee password
router.put(
  "/:eventId/attendees/:idNumber/password",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["Admin"]),
  changeAttendeePasswordV2Controller
);

// GET eligible raffle participants
router.get(
  "/raffle/:eventId/",
  requireAccessTokenV2,
  roleAuthenticateV2(["Admin"]),
  getEligibleAttendeesRaffleV2Controller
);

// POST draw raffle winner
router.post(
  "/raffle/:eventId/draw",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["Admin"]),
  drawEventRaffleWinnerController
);

// POST undo raffle winner
router.post(
  "/raffle/:eventId/undo/:attendeeId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["Admin"]),
  undoEventRaffleWinnerController
);
export default router;
