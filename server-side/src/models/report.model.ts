import mongoose, { Document, Schema, Types } from "mongoose";
import { IReportDocument } from "./report.interface";

const reportSchema = new Schema<IReportDocument>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Orders",
      required: true,
    },
    id_number: {
      type: String,
      required: true,
    },
    merch_id: {
      type: Schema.Types.ObjectId,
      ref: "merch",
      required: true,
    },
    item_count: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReportDocument>("Report", reportSchema);
