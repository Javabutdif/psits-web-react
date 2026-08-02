import mongoose, { Schema, Document } from "mongoose";
import { IPromoUsage } from "./promo.usage.interface";

export interface IPromoUsageDocument extends IPromoUsage, Document {}

const promoUsageSchema = new Schema<IPromoUsageDocument>({
  promo_id: {
    type: Schema.Types.ObjectId,
    ref: "Promo",
    required: true,
  },
  order_id: {
    type: Schema.Types.ObjectId,
    ref: "Orders",
    required: true,
  },
  merch_id: {
    type: Schema.Types.ObjectId,
    ref: "merch",
    required: true,
  },
  id_number: {
    type: String,
    ref: "Student",
    required: true,
  },
  promo_used: {
    type: Date,
    default: Date.now,
  },
});

export const PromoUsage = mongoose.model<IPromoUsageDocument>(
  "PromoUsage",
  promoUsageSchema
);
