const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const historySchema = new Schema({
  id_number: {
    type: String,
    unique: true,
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
  date: {
    type: String,
    require: true,
  },
  admin: {
    type: String,
    require: true,
  },
});

const MembershipHistory = mongoose.model("membshipHistory", historySchema);

module.exports = MembershipHistory;
