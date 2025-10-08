import mongoose, { Schema, Document, Types } from "mongoose";
import { ISettings } from "./settings.interface";

export interface ISettingsDocument extends ISettings, Document {}

const settingsSchema = new Schema<ISettingsDocument>({
  membership_price: {
    type: Number,
  },
});

export const Settings = mongoose.model<ISettingsDocument>(
  "Settings",
  settingsSchema
);
