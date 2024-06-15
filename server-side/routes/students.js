const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");

const router = express.Router();

// GET list of accepted students
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find({
      membership: "Accepted",
      status: "True",
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

// SOFT DELETE student by id_number
router.delete("/students/:id_number", async (req, res) => {
  const id_number = req.params.id_number;

  try {
    // Find and delete the student by id_number
    const deletedStudent = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          status: "False",
        },
      }
    );

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
});

// HARD DELETE student by id_number
router.delete("/students/hard_delete/:id_number", async (req, res) => {
  const id_number = req.params.id_number;

  try {
    // Find and delete the student by id_number
    const deletedStudent = await Student.findOneAndDelete({ id_number });

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
});

//Membership Request Fetch
router.get("/requestStudent", async (req, res) => {
  try {
    const students = await Student.find({ membership: "Pending" });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

//Edit Student
router.post("/editedStudent", async (req, res) => {
  const {
    id_number,
    rfid,
    first_name,
    middle_name,
    last_name,
    email,
    course,
    year,
  } = req.body;
  try {
    const result = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          rfid: rfid,
          first_name: first_name,
          middle_name: middle_name,
          last_name: last_name,
          email: email,
          course: course,
          year: year,
        },
      }
    );

    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
