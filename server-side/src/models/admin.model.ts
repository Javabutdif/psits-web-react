import mongoose, { Schema } from "mongoose";
import { IAdminDocument } from "./admin.interface";
import { account_status } from "../enums/status.enums";

const adminSchema = new Schema<IAdminDocument>({
  id_number: { type: String, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  name: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  position: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(account_status),
    default: account_status.ACTIVE,
  },
  campus: { type: String },
  access: { type: String, default: "admin" },
  currentRefreshToken: { type: String, default: null },
});

export const Admin = mongoose.model<IAdminDocument>("Admin", adminSchema);
