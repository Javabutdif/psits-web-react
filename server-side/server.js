const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const students = require("./models/StudentModel");
const mongodbConnection = require("./mongoDB/MongoDbConnection");

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

app.post("/api/register", (req, res) => {});

app.get("/api/data", (req, res) => {
  // Logic to fetch data from the database or elsewhere
  const data = { message: "Hello from Express.js backend!" };

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
