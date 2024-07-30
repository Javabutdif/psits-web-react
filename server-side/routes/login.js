const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const router = express.Router();
const token_key = process.env.JWT_SECRET;
router.post("/login", async (req, res) => {
  const { id_number, password } = req.body;

  try {
    let user;
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
        user = student;
        role = "Student";
      } else {
        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    } else {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        user = admin;
        role = "Admin";
      } else {
        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    }

    const token = jwt.sign({ user, role }, token_key, {
      expiresIn: "1h",
    });

    return res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
});

module.exports = router;
