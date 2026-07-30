import { Document, Types } from "mongoose";

export interface ISignee {
  name: string;
  designation: string;
  e_sig?: string;
}

export interface ICertificateTemplate {
  name: string;
  description?: string;
  ejsRelativePath: string;
  defaultSignees: ISignee[];
  defaultImages?: Record<string, string>;
  defaultFonts?: Record<string, string>;
  isActive: boolean;
  createdBy?: string;
}

export interface ICertificateTemplateDocument extends ICertificateTemplate, Document {
  _id: Types.ObjectId;
}
