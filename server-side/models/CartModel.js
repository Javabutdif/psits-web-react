const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Merch",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  sub_total: {
    type: Number,
    required: true,
    default: function () {
      return this.price * this.quantity;
    },
  },
  selectedVariations: {
    type: Array,
  },
  selectedSizes: {
    type: Array,
  },
});

// Rename the model to reflect it's an item, not the entire cart
const CartItem = mongoose.model("CartItem", cartItemSchema);

module.exports = CartItem;
