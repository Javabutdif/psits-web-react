import mongoose, { Schema, Document, Types } from "mongoose";
import { IEmail } from "./email.interface";

export interface IEmailDocument extends IEmail, Document {}

const emailSchema = new Schema<IEmailDocument>({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  email: { type: String, required: true },
  status: { type: String, default: "pending", required: true },
  subtype: { type: String },
  referenceCode: { type: String },
});

export const EmailQueue = mongoose.model<IEmailDocument>(
  "EmailQueue",
  emailSchema
);
