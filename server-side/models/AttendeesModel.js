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
    required: true,
  },
  course: {
    type: String,
    require: true,
  },
  year: {
    type: String,
    required: true,
  },
  campus: {
    type: String,
    required: true,
  },
  isAttended: {
    type: Boolean,
    required: false,
  },
  attendDate: {
    type: String,
  },
  confirmedBy: {
    type: String,
  },
});



module.exports = attendeeSchema;
