const express = require("express");
const Merch = require("../models/MerchModel");

const router = express.Router();

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
module.exports = router;
