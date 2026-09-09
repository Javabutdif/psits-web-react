import mongoose, { Schema, Document } from "mongoose";
import { IHistory } from "./history.interface";

export interface IHistoryDocument extends IHistory, Document {}

const historySchema = new Schema<IHistoryDocument>({
  id_number: {
    type: String,
    require: true,
  },
  rfid: {
    type: String,
  },
  reference_code: {
    // `require` (the typo used on the other fields below) is not a Mongoose
    // option, so this was never enforced — that is how a null and an empty
    // string reached a unique field.
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    require: true,
  },
  year: {
    type: Number,
    require: true,
  },
  course: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
  admin: {
    type: String,
    require: true,
  },
  total: {
    type: Number,
    require: true,
  },
});

export const MembershipHistory = mongoose.model<IHistoryDocument>(
  "membshipHistory",
  historySchema
);
