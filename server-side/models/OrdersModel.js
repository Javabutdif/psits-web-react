const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CartItem = require("./CartModel"); // Import the CartItem schema

const orderSchema = new Schema({
  id_number: {
    type: String,
    ref: "Student", // Reference the Student schema using id_number
    required: true,
  },
  student_name: {
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
  items: [CartItem.schema], // Embed Cart Item Schema to store details of each ordered item
  total: {
    type: Number,
    required: true,
  },
  order_date: {
    type: Date,
    required: true,
    default: Date.now, // Automatically set the order date to the current date
  },
  transaction_date: {
    type: Date,
  },
  order_status: {
    type: String,
    required: true,
  },
  admin: {
    type: String,
  },
  reference_code: {
    type: String,
  },
  limited: {
    type: Boolean,
  },
});

const Orders = mongoose.model("Orders", orderSchema);
module.exports = Orders;
