const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const raffleSchema = new Schema({
  id_number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  campus: {
    type: String,
    required: true,
  },
});

module.exports = raffleSchema;
