import { ICart } from "./cart.interface";
import { Types } from "mongoose";
export interface IPromoOrder {
  _id: Types.ObjectId;
  promo_name: string;
  promo_discount: boolean;
}

export interface IOrdersItems {
  product_id: Types.ObjectId;
  product_name: string;
  limited: boolean;
  price: number;
  quantity: number;
  sub_total: number;
  // check docs/error_memory.md line 54.
  imageUrl1: string;
  category: string;
  variation?: [String];
  sizes?: [String];
  batch: number;
}

export interface IOrders {
  id_number: string;
  rfid?: string;
  membership_discount: boolean;
  promo: IPromoOrder;
  student_name: string;
  course: string;
  year: number;
  items: IOrdersItems[];
  total: number;
  cash?: number;
  order_date: Date;
  transaction_date: Date;
  order_status: string;
  admin: string;
  reference_code: string;
  role: string;
}
