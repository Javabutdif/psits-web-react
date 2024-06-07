const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");

const router = express.Router();

router.post("/register", async (req, res) => {
  const {
    id_number,
    password,
    first_name,
    middle_name,
    last_name,
    email,
    course,
    year,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      id_number,
      password: hashedPassword,
      first_name,
      middle_name,
      last_name,
      email,
      course,
      year,
      status: "True",
      membership: "Pending",
    });
    await newStudent.save();

    res.status(201).json("Registration successful");
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json("Id number already exists");
    } else {
      res.status(500).json("Internal Server Error");
    }
  }
});

module.exports = router;
