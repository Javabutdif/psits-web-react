const express = require("express");
const bcrypt = require("bcrypt");
const Student = require("../models/StudentModel");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { id_number, password } = req.body;

  try {
    const student = await Student.findOne({ id_number });
    if (!student) {
      res.status(400).json({ error: "Invalid Credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);

    if (passwordMatch && student.membership === "Pending") {
      return res.status(400).json("Student must pay 50 in the PSITS Office");
    } else if (!passwordMatch) {
      return res.status(400).json("Invalid ID number or password");
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
