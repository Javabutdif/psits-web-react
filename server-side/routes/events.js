const express = require("express");
const { upload } = require("../util/aws.util");
const {
  admin_authenticate,
  both_authenticate,
} = require("../middlewares/custom_authenticate_token");
const {
  createManualEventController,
  getAllEventsController,
  getAllEventsAndAttendeesController,
  updateAttendancePerSessionController,
  checkLimitPerCampusController,
  updateLimitSettingsController,
  getEligibleAttendeesRaffleController,
  setAttendeeAsRaffleWinnerController,
  removeAttendeeInRaffleController,
  addAttendeeController,
  getEventStatisticsController,
  removeEventController,
  removeAttendanceController,
} = require("../controllers/event.controller");

require("dotenv").config();

const router = express.Router();

// POST: Create a new Event
router.post(
  "/create-event",
  admin_authenticate,
  upload.array("images", 3),
  createManualEventController
);

// GET all events
router.get("/get-all-event", both_authenticate, getAllEventsController);

// GET all events and attendees
router.get(
  "/attendees/:id",
  admin_authenticate,
  getAllEventsAndAttendeesController
);

// UPDATE Attendee attendance per session
router.put(
  "/attendance/:event_id/:id_number",
  admin_authenticate,
  updateAttendancePerSessionController
);
//Check Limit per campus
router.get(
  "/check-limit/:eventId",
  admin_authenticate,
  checkLimitPerCampusController
);
//update-settings
router.post(
  "/update-settings/:eventId",
  admin_authenticate,
  updateLimitSettingsController
);

// Get Eligible Attendees for Raffle
router.get(
  "/raffle/:eventId",
  admin_authenticate,
  getEligibleAttendeesRaffleController
);

// Mark Attendee as Raffle Winner
router.post(
  "/raffle/winner/:eventId/:attendeeId",
  admin_authenticate,
  setAttendeeAsRaffleWinnerController
);

// Remove Attendee from Raffle
router.put(
  "/raffle/remove/:eventId/:attendeeId",
  admin_authenticate,
  removeAttendeeInRaffleController
);
//Add attendee in events
router.post("/add-attendee", admin_authenticate, addAttendeeController);
//Get all statistic in events
router.get(
  "/get-statistics/:eventId",
  admin_authenticate,
  getEventStatisticsController
);
//Remove Events
router.post("/remove-event", admin_authenticate, removeEventController);
//Remove Attendee
router.post(
  "/remove-attendance",
  admin_authenticate,
  removeAttendanceController
);

module.exports = router;
