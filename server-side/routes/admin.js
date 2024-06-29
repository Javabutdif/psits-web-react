const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/AdminModel");
const MembershipHistory = require("../models/MembershipHistory");
const Student = require("../models/StudentModel");

const router = express.Router();

router.post("/admin", async (req, res) => {
  const { id_number, password, name, position } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      id_number,
      password: hashedPassword,
      name,
      position,
    });
    await newAdmin.save();

    res.status(201).json("Registration successful");
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json("Id number already exists");
    } else {
      console.error("Error saving new student:", error);
      res.status(500).json("Internal Server Error");
    }
  }
});

router.post("/approve-membership", async (req, res) => {
  const { id_number, admin, rfid, money } = req.body;

  try {
    const student = await Student.findOne({ id_number });
    const approveStudent = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          membership: "Accepted",
          rfid: rfid,
        },
      }
    );
    const history = new MembershipHistory({
      id_number,
      name:
        student.first_name +
        " " +
        student.middle_name +
        " " +
        student.last_name,
      year: student.year,
      course: student.course,
      date: Date.now(),
      admin,
    });
    await history.save();
    res.status(201).json("Approve student successful");
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json("Server Error!");
    } else {
      console.error("Error saving new student:", error);
      res.status(500).json("Internal Server Error");
    }
  }
});

router.get("/history", async (req, res) => {
  try {
    const students = await MembershipHistory.find();
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
