const express = require("express");
const bcrypt = require("bcrypt");
const Student = require("../models/Student"); // Adjust the path to your Student model

const router = express.Router();

router.post("/login", async (req, res) => {
  const { id_number, password } = req.body;

  try {
    const student = await Student.findOne({ id_number });
    if (!student) {
      res.status(400).json({ error: "Invalid Credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid ID number or password" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
