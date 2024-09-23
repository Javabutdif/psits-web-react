const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
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
  const { id_number, password } = req.body;

  try {
    let users;
    let role;

    const admin = await Admin.findOne({ id_number });

    if (!admin) {
      const student = await Student.findOne({ id_number });
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
        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    } else {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        users = admin;
        role = "Admin";
      } else {
        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    }

    const user = {
      id_number: users.id_number,
      rfid: role === "Student" ? users.rfid : "",
      name: role === "Admin" ? users.name : "",
      first_name: role === "Student" ? users.first_name : "",
      middle_name: role === "Student" ? users.middle_name : "",
      last_name: role === "Student" ? users.last_name : "",
      email: users.email,
      course: users.course,
      year: users.year,
      status: users.status,
      membership: users.membership,
      applied: users.applied,
      renew: users.renew,
      position: role === "Admin" ? users.position : "N/A",
    };

    // Create the token
    const token = jwt.sign({ user, role }, token_key, {
      expiresIn: role === "Admin" ? "1h" : "10m",
    });

    // Set the token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side access to the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: role === "Admin" ? 3600000 : 600000, // Same expiration as JWT
      sameSite: "Strict", // Adjust as necessary for your app
    });

    return res.json({ message: "Login successful", role });
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
