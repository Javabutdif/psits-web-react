const express = require("express");
const Events = require("../models/EventsModel");
const authenticateToken = require("../middlewares/authenticateToken");
const { ObjectId } = require("mongodb");

const router = express.Router();

// GET all events
router.get("/", authenticateToken, async (req, res) => {
  try {
    const events = await Events.find();
    console.log(events);
    return res.status(200).json({ data: events });
  } catch (error) {
    console.error(error);
  }
});

// GET all events and attendees
router.get("/attendees/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const eventId = new ObjectId(id);
    const attendees = await Events.find({ eventId });
    if (attendees) {
      res.status(200).json({ data: attendees });
    } else {
      res.status(500).json({ message: "No attendees" });
    }
  } catch (error) {
    console.error(error);
  }
});

// UPDATE Attendee isAttended property
router.put(
  "/attendance/:event_id/:id_number",
  authenticateToken,
  async (req, res) => {
    const { event_id, id_number } = req.params;

    try {
      const eventId = new ObjectId(event_id);
      const event = await Events.findOne({ eventId });

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendee = event.attendees.find(
        (attendee) => attendee.id_number === id_number
      );

      if (!attendee) {
        return res
          .status(404)
          .json({ message: "Attendee not found in this event" });
      }

      if (attendee.isAttended) {
        return res.status(400).json({ message: "Attendance already recorded" });
      }

      // TODO: Raffle

      attendee.isAttended = true;
      attendee.attendDate = new Date();
      attendee.confirmedBy = req.user?.name;

      await event.save();

      res.status(200).json({
        message: "Attendance successfully recorded",
        data: attendee,
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      res
        .status(500)
        .json({ message: "An error occurred while recording attendance" });
    }
  }
);

module.exports = router;
