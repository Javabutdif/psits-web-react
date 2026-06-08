import { ICart } from "./cart.interface";
import { Types } from "mongoose";
export interface IPromoOrder {
  _id: Types.ObjectId;
  promo_name: string;
  promo_discount: boolean;
}

export interface IOrders {
  id_number: string;
  rfid?: string;
  membership_discount: boolean;
  promo: IPromoOrder;
  student_name: string;
  course: string;
  year: number;
  items: ICart[];
  total: number;
  order_date: Date;
  transaction_date: Date;
  order_status: string;
  admin: string;
  reference_code: string;
  role: string;
}
