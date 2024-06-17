const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const merchSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    stocks: {
      type: Number,
      require: true,
    },
    batch: {
      type: Schema.Types.Mixed,
    },
    description: {
      type: String,
      require: true,
    },
    variation: {
      type: Array,
    },
    size: {
      type: Array,
    },
    created_by: {
      type: Schema.Types.Mixed,
      require: true,
    },
    start_date: {
      type: Date,
      require: true,
    },
    end_date: {
      type: Date,
      require: true,
    },
  },
  { timestamps: true }
);

const Merch = mongoose.model("merch", merchSchema);

module.exports = Merch;
