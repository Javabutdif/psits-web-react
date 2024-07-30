const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const salesDataSchema = new Schema({
  unitsSold: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
});

const merchSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stocks: {
      type: Number,
      required: true,
    },
    batch: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    selectedVariations: {
      type: Array,
    },
    selectedSizes: {
      type: Array,
    },
    control: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
    },
    is_active: {
      type: Boolean,
      default: true,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: Array,
    },
    sales_data: {
      type: salesDataSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

const Merch = mongoose.model("merch", merchSchema);

module.exports = Merch;
