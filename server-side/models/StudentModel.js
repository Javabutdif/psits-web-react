const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const students = new Schema({
  id_number: {
    type: String,
  },
  password: {
    type: String,
  },
  first_name: {
    type: String,
  },
});

const Data = mongoose.model("students", students);

module.exports = Data;
