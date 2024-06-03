const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const studentSchema = new Schema({
  id_number: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  first_name: {
    type: String,
    require: true,
  },
  middle_name: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  course: {
    type: String,
    require: true,
  },
  year: {
    type: Number,
    require: true,
  },
  status: {
    type: String,
  },
  membership: {
    type: String,
  },
});

const Student = mongoose.model("students", studentSchema);

module.exports = Student;
