const express = require("express");
const Events = require("../models/EventsModel");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const events = await Events.find();
    console.log(events);
    return res.status(200).json({ data: events });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
