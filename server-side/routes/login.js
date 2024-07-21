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

      if (passwordMatch && student.membership === "Pending") {
        return res.status(400).json({
          message:
            "You must pay the membership fee of ₱50 at the PSITS Office.",
        });
      } else if (
        passwordMatch &&
        student.membership === "Accepted" &&
        student.status === "False"
      ) {
        return res
          .status(400)
          .json({ message: "Your account has been deleted!" });
      } else if (
        passwordMatch &&
        student.membership === "Accepted" &&
        student.status === "True"
      ) {
        user = student;
        role = "Student";
      } else if (!passwordMatch) {
        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    } else {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        user = admin;
        role = "Admin";
      } else if (!passwordMatch) {
        return res
          .status(400)
          .json({ message: "Invalid ID number or password" });
      }
    }

    const token = jwt.sign(
      {
        id_number: user.id_number,
        name:
          role === "Admin"
            ? user.name
            : `${user.first_name} ${user.middle_name} ${user.last_name}`,
        role,
        position: role === "Admin" ? user.position : "N/A",
        email: role === "Student" ? user.email : "",
        course: role === "Student" ? user.course : "",
        year: role === "Student" ? user.year : "",
      },
      token_key,
      { expiresIn: role === "Admin" ? "1h" : "30m" }
    );

    return res.json({ token, message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error });
  }
});

module.exports = router;
