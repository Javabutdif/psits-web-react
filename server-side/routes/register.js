const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");

const router = express.Router();

router.post("/register", async (req, res) => {
  const {
    id_number,
    password,
    rfid,
    first_name,
    middle_name,
    last_name,
    email,
    course,
    year,
    applied,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      id_number,
      rfid: "N/A",
      password: hashedPassword,
      first_name,
      middle_name,
      last_name,
      email,
      course,
      year,
      status: "True",
      membership: "Pending",
      applied,
    });
    await newStudent.save();

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Id number already exists" });
    } else {
      console.error({ message: "Error saving new student:", error });
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

module.exports = router;
