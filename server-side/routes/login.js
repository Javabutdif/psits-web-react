const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
const Log = require("../models/LogModel");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();
const token_key = process.env.JWT_SECRET;
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, async (req, res) => {
  //TODO: Log (Done)
  const { id_number, password } = req.body;
  const currentDate = new Date();

  try {
    let users;
    let role;
    let admin = null;
    let student = null;

    if (id_number.includes("-admin")) {
      admin = await Admin.findOne({ id_number });
    }

    if (!admin) {
      student = await Student.findOne({ id_number });
      if (!student) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, student.password);

      if (passwordMatch && student.status === "False") {
        return res
          .status(400)
          .json({ message: "Your account has been deleted!" });
      } else if (passwordMatch && student.status === "True") {
        users = student;
        role = "Student";
      } else {
        console.log(
          `Invalid password from ${id_number} - ${
            student.first_name +
            " " +
            student.middle_name +
            " " +
            student.last_name
          } on ${currentDate}`
        );

        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    } else {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch && admin.status === "Active") {
        users = admin;
        role = "Admin";
      } else if (passwordMatch && admin.status === "Suspend") {
        return res.status(400).json({
          message: "Your account has been suspended! Please contact president",
        });
      } else {
        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    }

    const user = {
      _id: users._id,
      id_number: users.id_number,
      name:
        role === "Admin"
          ? users.name
          : users.first_name + " " + users?.middle_name + " " + users.last_name,
      email: users.email,
      course: users.course,
      year: users.year,
      position: role === "Admin" ? users.position : "Student",
    };

    const token = jwt.sign({ user, role }, token_key, {
      expiresIn: role === "Admin" ? "2h" : "10m",
    });

    console.log(
      `${id_number} - ${user.name} signed in successfully on ${currentDate}`
    );

    // Create a log only if the user is an Admin
    if (role === "Admin") {
      const log = new Log({
        admin: user.name,
        admin_id: users._id,
        action: "Admin Login",
      });

      await log.save();
      console.log("Admin login logged successfully!");
    }

    return res.json({ message: "Signed in successfully", role, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});

router.get("/protected-route", authenticateToken, (req, res) => {
  return res.json({
    message: "Access granted",
    user: req.user,
    role: req.role,
  });
});

module.exports = router;
