// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

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

// Define a schema and model
const Schema = mongoose.Schema;
const ItemSchema = new Schema({
  name: String,
  quantity: Number,
});

const Item = mongoose.model("Item", ItemSchema);

// Routes
app.post("/api/items", (req, res) => {
  const newItem = new Item(req.body);
  newItem
    .save()
    .then((item) => res.json(item))
    .catch((err) => res.status(400).json("Error: " + err));
});

app.get("/api/items", (req, res) => {
  Item.find()
    .then((items) => res.json(items))
    .catch((err) => res.status(400).json("Error: " + err));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
