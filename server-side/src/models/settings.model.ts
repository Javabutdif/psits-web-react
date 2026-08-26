import mongoose, { Schema, Document, Types } from "mongoose";
import { ISettings } from "./settings.interface";

export interface ISettingsDocument extends ISettings, Document {}

const settingsSchema = new Schema<ISettingsDocument>({
  membership_price: {
    type: Number,
  },
  studentCreatedAtBackfilled: {
    type: Boolean,
    default: false,
  },
  studentYearLastUpdated: {
    type: Date,
  },
  chatbotEnabled: {
    type: Boolean,
    default: true,
  },
  noetixDisabledAdmins: {
    type: [String],
    default: [],
  },
});

export const Settings = mongoose.model<ISettingsDocument>(
  "Settings",
  settingsSchema
);
