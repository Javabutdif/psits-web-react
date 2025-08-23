import mongoose, { Schema, Document, Types } from "mongoose";
import { ICart } from "./cart.interface";

export interface ICartDocument extends ICart, Document {}

const cartItemSchema = new Schema<ICartDocument>({
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
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },

  category: {
    type: String,
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
    type: Array<String>,
  },
  sizes: {
    type: Array<String>,
  },
  batch: {
    type: String,
  },
});

export const CartItem = mongoose.model<ICartDocument>(
  "CartItem",
  cartItemSchema
);
