import { Types } from "mongoose";

export interface IPromoUsage {
  promo_id: Types.ObjectId;
  order_id: Types.ObjectId;
  merch_id: Types.ObjectId;
  id_number: string;
  promo_used: Date;
}
