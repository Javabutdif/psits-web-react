const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const attendeeSchema = new Schema({
  id_number: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  campus: {
    type: String,
    required: true,
  },
  isAttended: {
    type: Boolean,
    default: false,
  },
  attendDate: {
    type: Date,
    default: null,
  },
  confirmedBy: {
    type: String,
    default: null,
  },
});

module.exports = attendeeSchema;
