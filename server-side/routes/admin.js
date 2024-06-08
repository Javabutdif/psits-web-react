const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/AdminModel");

const router = express.Router();

router.post("/admin", async (req, res) => {
  const { id_number, password, name, position } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      id_number,
      password: hashedPassword,
      name,
      position,
    });
    await newAdmin.save();

    res.status(201).json("Registration successful");
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json("Id number already exists");
    } else {
      console.error("Error saving new student:", error);
      res.status(500).json("Internal Server Error");
    }
  }
});

module.exports = router;
