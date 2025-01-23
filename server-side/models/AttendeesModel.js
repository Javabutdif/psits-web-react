const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const attendeeSchema = new Schema({
  id_number: {
    type: String,

  },
  email: {
    type: String,
  },

  name: {
    type: String,
    require: true,
  },
  course: {
    type: String,
    require: true,
  },
  year: {
    type: String,
    require: true,
  },
  campus: {
    type: String,
    require: true,
  },
  isAttended: {
    type: Boolean,
    require: false,
  },
  attendDate: {
    type: String,
  },
  confirmedBy: {
    type: String,
  },
});

const Attendee = mongoose.model("attendee", attendeeSchema);

module.exports = Attendee;
