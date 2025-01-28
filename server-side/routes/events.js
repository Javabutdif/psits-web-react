const express = require("express");
const Events = require("../models/EventsModel");
const authenticateToken = require("../middlewares/authenticateToken");
const { ObjectId } = require("mongodb");

const router = express.Router();

//Events.js api

router.get("/", authenticateToken, async (req, res) => {
  try {
    const events = await Events.find();
    console.log(events);
    return res.status(200).json({ data: events });
  } catch (error) {
    console.error(error);
  }
});
//get all attendees

//TODO
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

module.exports = router;
