const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
const { format } = require("date-fns");

const router = express.Router();

// GET list of accepted students
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find({
      status: "True",
      $or: [
        { renew: "Accepted" },
        { renew: "Pending" },
        { renew: { $exists: false } },
        { renew: "" },
      ],
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.put("/students/request", async (req, res) => {
  try {
    const { id_number } = req.body;

    await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          membership: "Pending",
        },
      }
    );
    res.status(200).json({ message: "Request submitted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting request", error: error.message });
  }
});

router.get("/students/deleted-students", async (req, res) => {
  try {
    const students = await Student.find({
      status: "False",
    });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.get("/students/get-membership-status", async (req, res) => {
  const { id_number } = req.query;
  try {
    const student = await Student.findOne({ id_number });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentStatus = {
      membership: student.membership,
      renew: student.renew,
    };

    res.status(200).json(studentStatus);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// SOFT DELETE student by id_number
router.put("/students/softdelete", async (req, res) => {
  const { id_number, name } = req.body;

  try {
    // Find and delete the student by id_number
    const deletedStudent = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          status: "False",
          deletedBy: name,
          deletedDate: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
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

router.put("/students/restore", async (req, res) => {
  const { id_number } = req.body;

  try {
    const restore = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          status: "True",
        },
      }
    );

    if (!restore) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
});

// HARD DELETE student by id_number
router.put("/students/cancel/:id_number", async (req, res) => {
  const id_number = req.params.id_number;

  try {
    const cancel = await Student.updateOne(
      { id_number: id_number },
      {
        $set: {
          membership: "None",
        },
      }
    );

    if (!cancel) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student cancel membership successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
});
//Membership Request Fetch

//Edit Student Admin Side
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

//Edit Profile Side

router.post("/edit", async (req, res) => {
  const { id_number, name, email, course, year, role } = req.body;
  try {
    if (role === "Admin") {
      const result = await Admin.updateOne(
        { id_number: id_number },
        {
          $set: {
            name: name,
            course: course,
            year: year,
          },
        }
      );
    } else {
      const result = await Student.updateOne(
        { id_number: id_number },
        {
          $set: {
            email: email,
            course: course,
            year: year,
          },
        }
      );
    }
    const user =
      role === "Student"
        ? await Student.findOne({ id_number })
        : await Admin.findOne({ id_number });
    const retrieveData =
      role === "Student"
        ? {
            data: user.email,
            course: user.course,
            year: user.year,
          }
        : {
            data: user.name,
            course: user.course,
            year: user.year,
          };

    res
      .status(200)
      .json({ student: retrieveData, message: role + " updated successfully" });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
