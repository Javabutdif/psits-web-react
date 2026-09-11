import mongoose, { Schema, Document } from "mongoose";
import { IHistory } from "./history.interface";

export interface IHistoryDocument extends IHistory, Document {}

const historySchema = new Schema<IHistoryDocument>({
  membership_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    index: true,
  },
  id_number: {
    type: String,
    ref: "Student",
    require: true,
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
  },
  year: {
    type: Number,
  },
  course: {
    type: String,
  },
  rfid: {
    type: String,
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
  "membershipHistory",
  historySchema
);
