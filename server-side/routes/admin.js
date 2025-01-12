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
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.post("/approve-membership", authenticateToken, async (req, res) => {
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
      updateQuery = {
        renew: "Accepted",
      
      };
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

router.put("/renew-student", authenticateToken, async (req, res) => {
  try {
    const renewStudent = await Student.updateMany(
      {
        status: "True",
        membership: "Accepted",
      },
      {
        $set: {
          renew: "None",
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

router.get("/history", authenticateToken, async (req, res) => {
  try {
    const students = await MembershipHistory.find().sort({ date: -1 });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});
router.get("/renew", authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ renew: "Pending" });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.get("/membershipRequest", authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ membership: "Pending" });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});
router.get("/all-members", authenticateToken, async (req, res) => {
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
router.get("/request-members", authenticateToken, async (req, res) => {
  const count = await Student.countDocuments({ membership: "Pending" });
  return res.json({ message: count });
});
router.get("/renewal-members", authenticateToken, async (req, res) => {
  const count = await Student.countDocuments({ renew: "Pending" });
  return res.json({ message: count });
});
router.get("/deleted-members", authenticateToken, async (req, res) => {
  const count = await Student.countDocuments({ status: "False" });
  return res.json({ message: count });
});
router.get("/history-members", authenticateToken, async (req, res) => {
  const count = await MembershipHistory.countDocuments();
  return res.json({ message: count });
});
router.get("/merchandise-created", authenticateToken, async (req, res) => {
  const count = await Merch.countDocuments();
  return res.json({ message: count });
});
router.get("/placed-orders", authenticateToken, async (req, res) => {
  const count = await Order.countDocuments({ order_status: "Pending" });
  return res.json({ message: count });
});
router.get("/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    const [
      bsitCount,
      bscsCount,
      actCount,
      year1Count,
      year2Count,
      year3Count,
      year4Count,
    ] = await Promise.all([
      Student.countDocuments({ course: "BSIT" }),
      Student.countDocuments({ course: "BSCS" }),
      Student.countDocuments({ course: "ACT" }),
      Student.countDocuments({ year: "1" }),
      Student.countDocuments({ year: "2" }),
      Student.countDocuments({ year: "3" }),
      Student.countDocuments({ year: "4" }),
    ]);

    return res.json({
      courses: {
        BSIT: bsitCount,
        BSCS: bscsCount,
        ACT: actCount,
      },
      years: {
        year1: year1Count,
        year2: year2Count,
        year3: year3Count,
        year4: year4Count,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching statistics." });
  }
});

router.get("/get-order-date", authenticateToken, async (req, res) => {
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

router.get("/get-all-officers", async (req, res) => {
  try {
    const officers = await Admin.find({ status: "Active" });

    const users = officers.map((officer) => ({
      id_number: officer.id_number,
      email: officer.email,
      name: officer.name,
      course: officer.course,
      year: officer.year,
      position: officer.position,
    }));

    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching officers:", error);
    res.status(500).json({ error: "Failed to fetch officers" });
  }
});

router.get("/get-suspend-officers", authenticateToken, async (req, res) => {
  try {
    const officers = await Admin.find({ status: "Suspend" });

    const users = officers.map((officer) => ({
      id_number: officer.id_number,
      email: officer.email,
      name: officer.name,
      course: officer.course,
      year: officer.year,
      position: officer.position,
    }));

    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching officers:", error);
    res.status(500).json({ error: "Failed to fetch officers" });
  }
});

router.post("/editOfficer", authenticateToken, async (req, res) => {
  const { id_number, name, position, email, course, year } = req.body;

  try {
    const adminResult = await Admin.updateOne(
      { id_number: id_number },
      {
        $set: {
          name: name,
          position: position,

          email: email,
          course: course,
          year: year,
        },
      }
    );

    if (adminResult.modifiedCount > 0) {
      res.status(200).json({ message: "Officer updated successfully" });
    } else {
      res.status(404).json({ error: "No officer found with the provided ID" });
    }
  } catch (error) {
    console.error("Error updating officer:", error);
    res.status(500).json({ error: "Failed to update officer" });
  }
});

router.post(
  "/admin/change-password-officer",
  authenticateToken,
  async (req, res) => {
    try {
      const getAdmin = await Admin.findOne({
        id_number: req.body.id_number,
      });

      if (!getAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      getAdmin.password = hashedPassword;
      await getAdmin.save();

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  }
);
router.put("/admin/suspend", authenticateToken, async (req, res) => {
  const { id_number } = req.body;

  try {
    const updatedAdmin = await Admin.updateOne(
      { id_number },
      {
        $set: {
          status: "Suspend",
        },
      }
    );

    if (updatedAdmin.modifiedCount > 0) {
      res.status(200).json({ message: "Admin status updated to Suspend" });
    } else {
      res.status(404).json({ message: "Admin not found or already suspended" });
    }
  } catch (error) {
    console.error("Error suspending admin:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

router.put("/admin/restore-officer", authenticateToken, async (req, res) => {
  const { id_number } = req.body;
  console.log(id_number);
  try {
    const updatedAdmin = await Admin.updateOne(
      { id_number },
      {
        $set: {
          status: "Active",
        },
      }
    );

    if (updatedAdmin.modifiedCount > 0) {
      res.status(200).json({ message: "Admin status updated to Active" });
    } else {
      res.status(404).json({ message: "Admin not found or already active" });
    }
  } catch (error) {
    console.error("Error activating admin:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

module.exports = router;
