const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  id_number: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  position: {
    type: String,
    require: true,
  },
});

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
