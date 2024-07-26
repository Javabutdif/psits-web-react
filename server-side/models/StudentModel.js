const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const studentSchema = new Schema({
  id_number: {
    type: String,
    unique: true,
  },
  rfid: {
    type: String,
    require: true,
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
  applied: {
    type: String,
  },
  deletedBy: {
    type: String,
  },
  deletedDate: {
    type: String,
  },
  renew: {
    type: String,
  },
  renewedOn: {
    type: String,
  },
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: "Merch",
    },
  ],
});

const Student = mongoose.model("students", studentSchema);

module.exports = Student;
