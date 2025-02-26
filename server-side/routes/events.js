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
      console.log(attendees);
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

// Event Raffle - Get the Event Attendees only
router.get("/raffle/get-all-attendees/:eventId", authenticateToken, async (req,res) => {
  const { eventId } = req.params;

  try{
    const event_id = new ObjectId(eventId);
    const event = await Events.findOne({ eventId: event_id });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Filter attendees based on campus if provided
    let eligibleAttendees = event.attendees.filter(
      (attendee) => !attendee.raffleIsRemoved && !attendee.raffleIsWinner
    );
    res.status(200).json({data:eligibleAttendees});

  }catch(error){
    console.error(error);
  }

})

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
      res.status(500).json({
        message:
          "An error occurred while removing the attendee from the raffle",
      });
    }
  }
);

router.post("/add-attendee", authenticateToken, async (req, res) => {
  try {
    const {
      id_number,
      first_name,
      middle_name,
      last_name,
      course,
      year,
      campus,
      email,
      shirt_size,
      shirt_price,
      applied,
      merchId,
    } = req.body;

    const event = await Events.findOne({ eventId: merchId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const campusData = event.sales_data.find((s) => s.campus === campus);
    if (!campusData) {
      return res.status(400).json({ message: "Invalid campus" });
    }

    campusData.unitsSold += 1;
    campusData.totalRevenue += Number.parseInt(shirt_price);

    event.totalUnitsSold += 1;
    event.totalRevenueAll += Number.parseInt(shirt_price);

    event.attendees.push({
      id_number,
      name: `${first_name} ${middle_name} ${last_name}`,
      email,
      course,
      year,
      campus,
      isAttended: false,
      shirtSize: shirt_size,
      shirtPrice: shirt_price,
    });

    await event.save();

    res.json({ message: "Attendee added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-statistics/:eventId", authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const event_id = new ObjectId(eventId);
    const event = await Events.findOne({ eventId: event_id });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const salesData = event.sales_data;

    const totalRevenue = event.totalRevenueAll;

    const attendees = event.attendees;

    const totalAttendees = attendees.length;

    const yearLevels = [1, 2, 3, 4].reduce((acc, year) => {
      const yearWord = ["First", "Second", "Third", "Fourth"][year - 1];
      acc[`${yearWord}`] = attendees.filter(
        (attendee) => attendee.year === year
      ).length;
      return acc;
    }, {});

    const yearLevelsAttended = [1, 2, 3, 4].reduce((acc, year) => {
      const yearWord = ["First", "Second", "Third", "Fourth"][year - 1];
      acc[`${yearWord}`] = attendees.filter(
        (attendee) => attendee.year === year && attendee.isAttended
      ).length;
      return acc;
    }, {});

    const yearLevelsByCampus = ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"].map(
      (campus) => {
        const campusWord = campus.split("-")[1];
        return {
          campus: campusWord,
          yearLevels: [1, 2, 3, 4].reduce((acc, year) => {
            const yearWord = ["First", "Second", "Third", "Fourth"][year - 1];
            acc[`${yearWord}`] = attendees.filter(
              (attendee) => attendee.year === year && attendee.campus === campus
            ).length;
            return acc;
          }, {}),
        };
      }
    );

    const campuses = ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"].reduce(
      (acc, campus) => {
        const campusWord = campus.split("-")[1];
        acc[`${campusWord}`] = attendees.filter(
          (attendee) => attendee.campus === campus
        ).length;
        return acc;
      },
      {}
    );
    const campusesAttended = ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"].reduce(
      (acc, campus) => {
        const campusWord = campus.split("-")[1];
        acc[`${campusWord}`] = attendees.filter(
          (attendee) => attendee.campus === campus && attendee.isAttended
        ).length;
        return acc;
      },
      {}
    );

    const courses = ["BSIT", "BSCS"].reduce((acc, course) => {
      acc[course] = attendees.filter(
        (attendee) => attendee.course === course
      ).length;
      return acc;
    }, {});

    res.status(200).json({
      yearLevels,
      campuses,
      courses,
      totalAttendees,
      yearLevelsByCampus,
      yearLevelsAttended,
      campusesAttended,
      totalRevenue,
      salesData,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/remove-attendance", authenticateToken, async (req, res) => {
  try {
    const { id_number, merchId } = req.body;

    const event = await Events.findOne({ eventId: merchId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const attendeeIndex = event.attendees.findIndex(
      (a) => a.id_number === id_number
    );
    if (attendeeIndex === -1) {
      return res.status(404).json({ message: "Attendee not found" });
    }

    const { campus, shirtPrice } = event.attendees[attendeeIndex];

    const campusData = event.sales_data.find((s) => s.campus === campus);
    if (campusData) {
      campusData.unitsSold -= 1;
      campusData.totalRevenue -= Number.parseInt(shirtPrice);
    }

    event.totalUnitsSold -= 1;
    event.totalRevenueAll -= Number.parseInt(shirtPrice);

    event.attendees.splice(attendeeIndex, 1);

    await event.save();

    res.json({ message: "Attendee removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
