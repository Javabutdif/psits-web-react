import { Types } from "mongoose";
export interface ISelectMerchandise {
  _id: Types.ObjectId;
  name: string;
}

export interface IPromo {
  promo_name: string;
  type: string;
  limit_type: string;
  one_person_limit: boolean;
  selected_audience: String[];
  selected_specific_students: String[];
  selected_categories: string[];
  discount: number;
  quantity: number;
  start_date: Date;
  end_date: Date;
  status: string;
  promo_scope: "Merchandise" | "Category" | "Both";
  selected_merchandise: ISelectMerchandise[];
  created_by: string;
}
