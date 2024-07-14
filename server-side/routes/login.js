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
    //Find admin
    const admin = await Admin.findOne({ id_number });

    if (!admin) {
      //Not Admin it will query to find the student
      const student = await Student.findOne({ id_number });
      if (!student) {
        res.status(400).json("Invalid Credentials");
      }

      const passwordMatch = await bcrypt.compare(password, student.password);

      if (passwordMatch && student.membership === "Pending") {
        return res
          .status(400)
          .json("You must pay the membership fee of ₱50 at the PSITS Office.");
      } else if (
        passwordMatch &&
        student.membership === "Accepted" &&
        student.status === "False"
      ) {
        return res.status(400).json("Your account has been deleted!");
      } else if (
        passwordMatch &&
        student.membership === "Accepted" &&
        student.status === "True"
      ) {
        user = student;
        role = "Student";
      } else if (!passwordMatch) {
        return res.status(400).json("Invalid ID number or password");
      }
    } else {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        user = admin;
        role = "Admin";
      } else if (!passwordMatch) {
        return res.status(400).json("Invalid ID number or password");
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
      },
      token_key,
      { expiresIn: role === "Admin" ? "1h" : "30m" }
    );

    // Return the token
    return res.json({ token });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
