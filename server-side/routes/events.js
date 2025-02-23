const express = require("express");
const Events = require("../models/EventsModel");
const authenticateToken = require("../middlewares/authenticateToken");
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");

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

      attendee.isAttended = true;
      attendee.attendDate = new Date();
      attendee.confirmedBy = req.user?.name;

      await event.save();

      await Events.findOneAndUpdate(
        { eventId },
        {
          $push: {
            raffle: {
              id_number: id_number,
              name: attendee.name,
              campus: attendee.campus,
            },
          },
        }
      );

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

router.get("/check-limit/:eventId", authenticateToken, async (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  const event_id = new ObjectId(eventId);
  try {
    const event = await Events.findOne({ eventId: event_id });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ data: event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
//update-settings
router.post(
  "/update-settings/:eventId",
  authenticateToken,
  async (req, res) => {
    const { banilad, pt, lm } = req.body;
    const event_id = new ObjectId(req.params.eventId);
    console.log("Already in the server");
    try {
      const response = await Events.findOneAndUpdate(
        { eventId: event_id },
        {
          $set: {
            limit: [
              { campus: "UC-Banilad", limit: banilad },
              { campus: "UC-PT", limit: pt },
              { campus: "UC-LM", limit: lm },
            ],
          },
        },
        { new: true }
      );

      if (!response) {
        return res.status(404).json({ message: "Event not found" });
      }

      res
        .status(200)
        .json({ message: "Settings updated successfully", data: response });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating settings" });
    }
  }
);

// Event Raffle - Randomized Fetch for One Attendee and set raffleIsWinner = true
router.post("/raffle/:eventId", authenticateToken, async (req, res) => {
  const { eventId } = req.params;
  const { campus } = req.body; // Accept campus filter from request body

  try {
    const event_id = new ObjectId(eventId);
    const event = await Events.findOne({ eventId: event_id });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Filter attendees based on campus if provided
    let eligibleAttendees = event.attendees.filter(
      (attendee) => !attendee.raffleIsRemoved && !attendee.raffleIsWinner
    );

    if (campus) {
      eligibleAttendees = eligibleAttendees.filter(
        (attendee) => attendee.campus === campus
      );
    }

    if (eligibleAttendees.length === 0) {
      return res
        .status(400)
        .json({ message: "No eligible attendees for raffle" });
    }

    // Randomly select one attendee
    const winnerIndex = Math.floor(Math.random() * eligibleAttendees.length);
    const winner = eligibleAttendees[winnerIndex];

    // Update the winner's status
    winner.raffleIsWinner = true;
    await event.save();

    res.status(200).json({
      message: "Raffle winner selected successfully",
      winner: {
        id_number: winner.id_number,
        name: winner.name,
        campus: winner.campus,
      },
    });
  } catch (error) {
    console.error("Error selecting raffle winner:", error);
    res
      .status(500)
      .json({ message: "An error occurred while selecting a raffle winner" });
  }
});

// Remove Attendee from Raffle
router.put(
  "/raffle/remove/:eventId/:attendeeId",
  authenticateToken,
  async (req, res) => {
    const { eventId, attendeeId } = req.params;

    try {
      const event_id = new ObjectId(eventId);
      const event = await Events.findOne({ eventId: event_id });

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendee = event.attendees.find(
        (att) => att.id_number === attendeeId
      );

      if (!attendee) {
        return res
          .status(404)
          .json({ message: "Attendee not found in this event" });
      }

      // Update attendee raffle status
      attendee.raffleIsWinner = false;
      attendee.raffleIsRemoved = true;

      await event.save();

      res.status(200).json({
        message: "Attendee removed from raffle successfully",
        attendee: {
          id_number: attendee.id_number,
          name: attendee.name,
          campus: attendee.campus,
        },
      });
    } catch (error) {
      console.error("Error removing attendee from raffle:", error);
      res
        .status(500)
        .json({
          message:
            "An error occurred while removing the attendee from the raffle",
        });
    }
  }
);

module.exports = router;
