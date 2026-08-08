import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { r2Client } from "../lib/r2Client";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  requireActiveStudentMembershipV2,
} from "../middlewares/authV2.middleware";

import {
  addAttendeeV2Controller,
  addWalkInAttendeeV2Controller,
  changeAttendeePasswordV2Controller,
  createEventV2Controller,
  drawEventRaffleWinnerController,
  editAttendeeV2Controller,
  getAllEventsV2Controller,
  getEditableAttendeeV2Controller,
  getEligibleAttendeesRaffleV2Controller,
  getEventAttendeesV2Controller,
  getEventByIdV2Controller,
  getEventImageController,
  getEventStatisticsV2Controller,
  getMyEventsController,
  markAttendanceV2Controller,
  undoEventRaffleWinnerController,
  getAllEventsRawController,
  updateEventV2Controller,
  applyToEventV2Controller,
} from "../controllers/eventV2.controller";

const router = Router();

const getUpload = () => {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) return multer();

  return multer({
    storage: multerS3({
      s3: r2Client,
      bucket,
      metadata: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: any, metadata?: any) => void
      ) => {
        cb(null, { fieldName: file.fieldname });
      },
      contentType: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: any, contentType?: string) => void
      ) => {
        cb(null, file.mimetype);
      },
      key: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: any, key?: string) => void
      ) => {
        const ext = path.extname(file.originalname);
        cb(
          null,
          `events/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`
        );
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG, PNG, WebP, GIF images are allowed"));
      }
    },
  });
};

// POST: Create a new Event via V2
router.post(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  getUpload().array("images", 3),
  (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        error: "UPLOAD_ERROR",
        message: err.message,
      });
    }
    if (err) {
      console.error("Event V2 upload failed:", err);
      return res.status(500).json({
        error: "UPLOAD_ERROR",
        message: "Image upload failed",
      });
    }
    next();
  },
  createEventV2Controller
);

// GET all events
router.get(
  "/get-all-event",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  getAllEventsV2Controller
);

// GET all events raw (eventId and eventName only)
router.get(
  "/get-all-events-raw",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllEventsRawController
);

// GET all events the student is attended in,
// with their attendance record filtered per event
router.get(
  "/my-events",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  //requireActiveStudentMembershipV2, //temporary disabling for CCS Fresman Orientation
  getMyEventsController
);

// GET proxied event image (streams from private R2 bucket)
// Must come before "/:eventId" so it isn't shadowed by that param route.
router.get("/image/*", getEventImageController);

// GET specific event
router.get(
  "/:eventId",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  getEventByIdV2Controller
);

router.post(
  "/:eventId/apply",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  applyToEventV2Controller
);

// PATCH edit event details
router.patch(
  "/:eventId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  getUpload().array("images", 3),
  (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: "UPLOAD_ERROR", message: err.message });
    }
    if (err) {
      console.error("Event V2 update upload failed:", err);
      return res
        .status(500)
        .json({ error: "UPLOAD_ERROR", message: "Image upload failed" });
    }
    next();
  },
  updateEventV2Controller
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

// POST add walk-in attendee (lightweight, no account creation, all campuses)
router.post(
  "/:eventId/attendees/walk-in",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  addWalkInAttendeeV2Controller
);

// PUT mark attendance for a specific attendee in an event
// Added Temporary Access For "Student" will delete after freshman Orientation
router.put(
  "/:eventId/attendance/:idNumber",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin", "student"]),
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
