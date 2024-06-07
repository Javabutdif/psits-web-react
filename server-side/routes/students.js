const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");

const router = express.Router();

router.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});
module.exports = router;
