// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
import "./model/user.js";

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection

mongoose
  .connect(
    "mongodb+srv://jamesgenabio31:09083095890a@psits.hxpgzht.mongodb.net/?retryWrites=true&w=majority&appName=psits",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.post("/api/register", (req, res) => {
  const {
    id_number,
    password,
    first_name,
    middle_name,
    last_name,
    email,
    course,
    year,
  } = req.body;

  // Handle the registration logic (e.g., save to database)
  // For example:
  const newUser = new User({
    id_number,
    password,
    first_name,
    middle_name,
    last_name,
    email,
    course,
    year,
  });

  newUser
    .save()
    .then((user) => res.status(201).json(user))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
