import mongoose from "mongoose";
export interface IUserItems {
  product_id: mongoose.Types.ObjectId;
  imageUrl1?: string;
  product_name: string;
  limited: boolean;
  price: number;
  discount: number;
  quantity: number;
  sub_total: number;
  variation: string;
  sizes: string;
  batch: string;
  category: string;
}

export interface IOrderProcessingResult {
  orderItems: IUserItems[];
  orderTotal: number;
}
export interface IOrderFinalizationResult {
  id_number: string;
  promo: IFinalPromoDiscount;
  course: string;
  year: number;
  student_name: string;
  items: IUserItems[];
  total: number;
  order_date: Date;
  order_status: string;
  role: string;
}
export interface IFinalPromoDiscount {
  _id: mongoose.Types.ObjectId;
  promo_name: string;
  promo_discount: number;
}
