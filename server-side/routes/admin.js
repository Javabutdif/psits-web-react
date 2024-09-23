const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/AdminModel");
const MembershipHistory = require("../models/MembershipHistory");
const Merch = require("../models/MerchModel");
const Student = require("../models/StudentModel");
const Order = require("../models/OrdersModel");
const { format, startOfDay, endOfDay } = require("date-fns");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const router = express.Router();

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
          renewedOn: new Date(),
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
    const student = await Student.findOne({ id_number });

    if (!student) {
      console.error(`Student with id_number ${id_number} not found.`);
      return res.status(404).json({ message: "Student not found" });
    }

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

    await Student.updateOne({ id_number }, { $set: updateQuery });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

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
router.get("/get-bsit", async (req, res) => {
  const count = await Student.countDocuments({ course: "BSIT" });
  return res.json({ message: count });
});
router.get("/get-bscs", async (req, res) => {
  const count = await Student.countDocuments({ course: "BSCS" });
  return res.json({ message: count });
});
router.get("/get-act", async (req, res) => {
  const count = await Student.countDocuments({ course: "ACT" });
  return res.json({ message: count });
});
router.get("/get-year1", async (req, res) => {
  const count = await Student.countDocuments({ year: "1" });
  return res.json({ message: count });
});
router.get("/get-year2", async (req, res) => {
  const count = await Student.countDocuments({ year: "2" });
  return res.json({ message: count });
});
router.get("/get-year3", async (req, res) => {
  const count = await Student.countDocuments({ year: "3" });
  return res.json({ message: count });
});
router.get("/get-year4", async (req, res) => {
  const count = await Student.countDocuments({ year: "4" });
  return res.json({ message: count });
});
router.get("/get-order-date", async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDayDate = startOfDay(currentDate);
    const endOfDayDate = endOfDay(currentDate);

    const result = await Order.aggregate([
      {
        $match: {
          transaction_date: {
            $gte: startOfDayDate,
            $lte: endOfDayDate,
          },
          order_status: "Paid",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          totalQuantity: { $sum: "$items.quantity" },
          totalSubtotal: { $sum: "$items.sub_total" },
        },
      },
      {
        $project: {
          product_name: "$_id",
          totalQuantity: 1,
          totalSubtotal: 1,
          _id: 0,
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error fetching orders by date:", error);
    res.status(500).json({ error: "An error occurred while fetching orders" });
  }
});

module.exports = router;
