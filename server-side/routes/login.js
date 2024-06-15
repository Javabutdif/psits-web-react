const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();

// POST to login
router.post("/login", async (req, res) => {
  const { id_number, password } = req.body;

  try {
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
        return res.json({
          role: "Student",
          id_number: student.id_number,
          name:
            student.first_name +
            " " +
            student.middle_name +
            " " +
            student.last_name,
          position: "N/A",
        });
      } else if (!passwordMatch) {
        return res.status(400).json("Invalid ID number or password");
      }
    } else {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        return res.json({
          role: "Admin",
          id_number: admin.id_number,
          name: admin.name,
          position: admin.position,
        });
      } else if (!passwordMatch) {
        return res.status(400).json("Invalid ID number or password");
      }
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// POST forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  Student.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.send({ status: "user does not exist" });
    }

    // TODO: IMPORTANT! Create JWT Secret Key in .env and replace "jwt_secret_key"
    // const token = jwt.sign({ id: user._id }, "jwt_secret_key", {
    //   expiresIn: "1d",
    // });

    // TODO: IMPORTANT! Replace gmail with PSITS Dev email ASAP
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "youremail@gmail.com",
    //     pass: "yourpassword", //
    //   },
    // });

    // const mailOptions = {
    //   from: "youremail@gmail.com",
    //   to: "myfriend@yahoo.com",
    //   subject: "Sending Email using Node.js",
    //   text: "That was easy!",
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });
  });
});

module.exports = router;
