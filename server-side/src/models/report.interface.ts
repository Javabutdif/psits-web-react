import { Document, Types } from "mongoose";

export interface IReport {
  order_id: Types.ObjectId;
  student_id: string;
  merch_id: Types.ObjectId;
  item_count: number;
  total: number;
  date: Date;
}

export interface IReportDocument extends IReport, Document {
  _id: Types.ObjectId;
}
