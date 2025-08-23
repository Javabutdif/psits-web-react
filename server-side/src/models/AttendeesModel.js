const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSessionSchema = new Schema(
  {
    attended: { type: Boolean, default: false },
    timestamp: { type: Date },
  },
  { _id: false }
);

const attendeeSchema = new Schema({
  id_number: {
    type: String,
    required: true,
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

  attendance: {
    type: new Schema(
      {
        morning: { type: attendanceSessionSchema, required: false },
        afternoon: { type: attendanceSessionSchema, required: false },
        evening: { type: attendanceSessionSchema, required: false },
      },
      { _id: false }
    ),
    required: false,
  },
  confirmedBy: {
    type: String,
  },
  shirtSize: {
    type: String,
  },
  shirtPrice: {
    type: Number,
  },
  raffleIsRemoved: {
    type: Boolean,
    default: false,
  },
  raffleIsWinner: {
    type: Boolean,
    default: false,
  },
  transactBy: {
    type: String,
  },
  transactDate: {
    type: Date,
  },
});

module.exports = attendeeSchema;
