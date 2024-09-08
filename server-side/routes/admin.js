const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/AdminModel");
const MembershipHistory = require("../models/MembershipHistory");
const Merch = require("../models/MerchModel");
const Student = require("../models/StudentModel");
const Order = require("../models/OrdersModel");
const { format } = require("date-fns");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const router = express.Router();

router.post("/admin", async (req, res) => {
  const { id_number, email, password, name, course, year, position } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      id_number,
      email,
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
  const { reference_code, id_number, type, admin, rfid, date, cash, total } =
    req.body;

  try {
    // Fetch the student from the database
    const student = await Student.findOne({ id_number });

    if (!student) {
      console.error(`Student with id_number ${id_number} not found.`);
      return res.status(404).json({ message: "Student not found" });
    }

    // Create and save membership history
    const history = new MembershipHistory({
      id_number,
      rfid,
      reference_code,
      type,
      name: `${student.first_name} ${student.middle_name} ${student.last_name}`,
      year: student.year,
      course: student.course,
      date,
      admin,
    });

    const savedHistory = await history.save();

    if (!savedHistory) {
      console.error("Failed to save membership history.");
      return res
        .status(500)
        .json({ message: "Failed to save membership history" });
    }

    let updateQuery = {};
    if (type === "Membership") {
      updateQuery = { membership: "Accepted", rfid: rfid };
    } else if (type === "Renewal") {
      updateQuery = { renew: "Accepted" };
    }

    // Update student information
    await Student.updateOne({ id_number }, { $set: updateQuery });

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    // Render the email template
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/appr-membership-receipt.ejs"), // Path to the ejs file
      {
        name: `${student.first_name} ${student.middle_name} ${student.last_name}`,
        reference_code,
        cash,
        total,
        course: student.course,
        year: student.year,
        admin,
        date: format(new Date(date), "MMMM d, yyyy"),
        change: cash - total,
      }
    );

    const mailOptions = {
      from: process.env.EMAIL,
      to: student.email,
      subject: "Your Receipt from PSITS - UC Main",
      html: emailTemplate,
      attachments: [
        {
          filename: "psits.jpg",
          path: path.join(__dirname, "../src/psits.jpg"),
          cid: "logo",
        },
      ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error sending email", error: error.message });
      } else {
        return res
          .status(200)
          .json({ message: "Approve student successful and email sent" });
      }
    });
  } catch (error) {
    console.error("Internal server error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
    $or: [
      { renew: "Accepted" },
      { renew: { $exists: false } },
      { renew: "" },
      { renew: "Pending" },
    ],
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
router.get("/merchandise-created", async (req, res) => {
  const count = await Merch.countDocuments();
  return res.json({ message: count });
});
router.get("/placed-orders", async (req, res) => {
  const count = await Order.countDocuments({ order_status: "Pending" });
  return res.json({ message: count });
});

module.exports = router;
