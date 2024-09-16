const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const historySchema = new Schema({
  id_number: {
    type: String,
    require: true,
  },
  rfid: {
    type: String,
  },
  reference_code: {
    type: String,
    unique: true,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  year: {
    type: String,
    require: true,
  },
  course: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
  admin: {
    type: String,
    require: true,
  },
});

const MembershipHistory = mongoose.model("membshipHistory", historySchema);

module.exports = MembershipHistory;
