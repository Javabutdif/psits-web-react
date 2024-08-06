const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/AdminModel");
const MembershipHistory = require("../models/MembershipHistory");
const Student = require("../models/StudentModel");
const { format } = require("date-fns");

const router = express.Router();

router.post("/admin", async (req, res) => {
  const { id_number, password, name, course, year, position } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      id_number,
      password: hashedPassword,
      name,
      course,
      year,
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

router.put("/renew-student", async (req, res) => {
  try {
    const renewStudent = await Student.updateMany(
      {
        status: "True",
        membership: "Accepted",
      },
      {
        $set: {
          renew: "Pending",
          renewedOn: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
        },
      }
    );

    if (!renewStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res
      .status(200)
      .json({ message: "All Student has been renewed successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.post("/approve-membership", async (req, res) => {
  const { reference_code, id_number, type, admin, rfid, date } = req.body;

  try {
    const student = await Student.findOne({ id_number });

    const history = new MembershipHistory({
      id_number,
      reference_code,
      type,
      name:
        student.first_name +
        " " +
        student.middle_name +
        " " +
        student.last_name,
      year: student.year,
      course: student.course,
      date,
      admin,
    });
    if (await history.save()) {
      if (type === "Membership") {
        const approveStudent = await Student.updateOne(
          { id_number: id_number },
          {
            $set: {
              membership: "Accepted",
              rfid: rfid,
            },
          }
        );
      } else if (type === "Renewal") {
        const renewStudent = await Student.updateOne(
          { id_number: id_number },
          {
            $set: {
              renew: "Accepted",
            },
          }
        );
      }
      res.status(200).json({ message: "Approve student successful" });
    } else {
      res.status(400).json({ message: "Approve Unsuccessful" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

router.get("/history", async (req, res) => {
  try {
    const students = await MembershipHistory.find().sort({ date: -1 });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});
router.get("/renew", async (req, res) => {
  try {
    const students = await Student.find({ renew: "Pending" });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.get("/membershipRequest", async (req, res) => {
  try {
    const students = await Student.find({ membership: "Pending" });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});
router.get("/all-members", async (req, res) => {
  const count = await Student.countDocuments({
    status: "True",
    $or: [{ renew: "Accepted" }, { renew: { $exists: false } }, { renew: "" }],
  });
  return res.json({ message: count });
});
router.get("/request-members", async (req, res) => {
  const count = await Student.countDocuments({ membership: "Pending" });
  return res.json({ message: count });
});
router.get("/renewal-members", async (req, res) => {
  const count = await Student.countDocuments({ renew: "Pending" });
  return res.json({ message: count });
});
router.get("/deleted-members", async (req, res) => {
  const count = await Student.countDocuments({ status: "False" });
  return res.json({ message: count });
});
router.get("/history-members", async (req, res) => {
  const count = await MembershipHistory.countDocuments();
  return res.json({ message: count });
});
module.exports = router;
