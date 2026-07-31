import mongoose, { Schema } from "mongoose";
import { ICertificateTemplateDocument } from "./certificateTemplate.interface";

const signeeSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    e_sig: { type: String },
  },
  { _id: false }
);

const certificateTemplateSchema = new Schema<ICertificateTemplateDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ejsRelativePath: { type: String, required: true },
    defaultSignees: { type: [signeeSchema], default: [] },
    defaultImages: {
      type: Map,
      of: String,
      default: {},
    },
    defaultFonts: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export const CertificateTemplate = mongoose.model<ICertificateTemplateDocument>(
  "CertificateTemplate",
  certificateTemplateSchema
);
