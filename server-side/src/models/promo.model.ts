import mongoose, { Schema, Document, Types } from "mongoose";
import { IPromo, ISelectMerchandise, IItemsAvail } from "./promo.interface";

export interface IPromoDocument extends IPromo, Document {}

const ItemsAvailSchema = new Schema<IItemsAvail>({
  id_number: {
    type: String,
    ref: "Student",
    required: true,
  },
  promo_used: {
    type: Date,
    default: new Date(),
  },
});

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
    items: [ItemsAvailSchema],
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
