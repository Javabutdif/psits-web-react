const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const promoSchema = new Schema({
  merch_id: {
    type: Schema.Types.ObjectId,
    ref: "Merch",
    required: true,
  },
  promo_code: {
    type: String,
    required: true,
    unique: true,
  },
  promoName: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  promoDescription: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
});

const Promo = mongoose.model("promo", promoSchema);

module.exports = Promo;
