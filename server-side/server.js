const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const Student = require("./models/StudentModel");
const mongodbConnection = require("./mongoDB/MongoDbConnection");
const bcrypt = require("bcrypt");

//Middleware
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(mongodbConnection(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.post("/api/register", async (req, res) => {
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

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      id_number,
      password: hashedPassword,
      first_name,
      middle_name,
      last_name,
      email,
      course,
      year,
      status: "True",
      membership: "Pending",
    });
    await newStudent.save();
    res.status(201).json({ message: "Registration successful", newStudent });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Id number already exists" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.get("/api/data", (req, res) => {
  // Logic to fetch data from the database or elsewhere
  const data = { message: "Hello from Express.js backend!" };

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
