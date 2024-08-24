const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Merch",
    required: true,
  },
  imageUrl1: {
    type: String,
  },
  product_name: {
    type: String,
    required: true,
  },
  limited: {
    type: Boolean,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  
  },
  sub_total: {
    type: Number,
    required: true,
  },
  variation: {
    type: Array,
  },
  sizes: {
    type: Array,
  },
  batch: {
    type: String,
  },
});

// Export as CartItem
const CartItem = mongoose.model("CartItem", cartItemSchema);
module.exports = CartItem;
