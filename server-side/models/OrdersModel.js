const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  id_number: {
    type: String,
    required: true,
  },
  rfid: {
    type: String,
    required: true,
  },
  course: {
    type: String,
  },
  year: {
    type: String,
  },
  student_name: {
    type: String,
  },
  product_id: {
    type: String,
  },
  product_name: {
    type: String,
  },
  category: {
    type: String,
  },
  sizes: {
    type: String,
  },
  variation: {
    type: Array,
  },
  batch: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  total: {
    type: Number,
  },

  order_date: {
    type: String,
  },
  order_status: {
    type: String,
  },
  limited: {
    type: String,
  },
});

const Orders = mongoose.model("orders", orderSchema);

module.exports = Orders;
