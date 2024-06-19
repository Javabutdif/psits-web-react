const express = require("express");
const Merch = require("../models/MerchModel");

const router = express.Router();

// CREATE a new merch
router.post("/", async (req, res) => {
  const {
    name,
    price,
    stocks,
    batch, //
    description,
    variation, //
    size, //
    created_by,
    start_date,
    end_date,
  } = req.body;

  try {
    const newMerch = new Merch({
      name,
      price,
      stocks,
      batch, //
      description,
      variation, //
      size, //
      created_by,
      start_date,
      end_date,
    });

    await newMerch.save();

    res.status(201).json("Merch Addition Successful");
  } catch (error) {
    console.error("Error saving new student:", error.message);
    res.status(500).send(error.message);
  }
});

// GET list of merches
router.get("/", async (req, res) => {
  try {
    const merches = await Merch.find();
    res.status(200).json(merches);
  } catch (error) {
    console.error("Error fetching students:", error.message);
    res.status(500).send(error.message);
  }
});

// GET merch by id
router.get("/:_id", async (req, res) => {
  const id = req.params._id;

  try {
    const merch = await Merch.findById(id);

    if (!merch) {
      return res.status(404).json({ message: "Merch not found!" });
    }

    res.status(200).json(merch);
  } catch (error) {
    console.error("Error fetching merch:", error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
