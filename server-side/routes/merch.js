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
    console.error("Error saving new merch:", error.message);
    res.status(500).send(error.message);
  }
});

// GET list of merches
router.get("/", async (req, res) => {
  try {
    const merches = await Merch.find();
    res.status(200).json(merches);
  } catch (error) {
    console.error("Error fetching merches:", error.message);
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

// UPDATE merch by id
router.put("/:_id", async (req, res) => {
  const {
    name,
    price,
    stocks,
    batch, //
    description,
    variation, //
    size, //
    start_date,
    end_date,
  } = req.body;

  const id = req.params._id;

  try {
    const result = await Merch.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          price: price,
          stocks: stocks,
          batch: batch, //
          description: description,
          variation: variation, //
          size: size, //
          start_date: start_date,
          end_date: end_date,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.error("Merch not found");
      return res.status(404).send("Merch not found");
    }

    res.status(200).send("Merch updated successfully");
  } catch (error) {
    console.error("Error updating merches:", error.message);
    res.status(500).send(error.message);
  }
});

// DELETE merch by id (soft)
router.delete("/:_id", async (req, res) => {
  const id = req.params._id;

  try {
    const result = await Merch.updateOne(
      { _id: id },
      {
        $set: {
          isActive: false,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.error("Merch not found");
      return res.status(404).send("Merch not found");
    }

    res.status(200).send("Merch deleted successfully");
  } catch (error) {
    console.error("Error deleting merch:", error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
