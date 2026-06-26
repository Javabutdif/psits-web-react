import mongoose, { Schema, Document } from "mongoose";
import { IPromo, ISelectMerchandise } from "./promo.interface";

export interface IPromoDocument extends IPromo, Document {}

const SelectMerchandiseSchema = new Schema<ISelectMerchandise>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "Merch",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const promoSchema = new Schema<IPromoDocument>({
  promo_name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  limit_type: {
    type: String,
    required: true,
  },
  one_person_limit: {
    type: Boolean,
    required: true,
  },
  selected_audience: [String],
  selected_specific_students: [String],
  selected_categories: {
    type: [String],
    default: [],
  },
  promo_scope: {
    type: String,
    enum: ["merchandise"],
    default: "merchandise",
  },
  discount: {
    type: Number,
    required: true,
  },
  quantity: {
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
  selected_merchandise: [SelectMerchandiseSchema],
  status: {
    type: String,
    default: "Active",
  },
  created_by: {
    type: String,
  },
});

export const Promo = mongoose.model<IPromoDocument>("Promo", promoSchema);
