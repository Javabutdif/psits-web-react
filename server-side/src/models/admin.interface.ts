import { Document } from "mongoose";
import mongoose from "mongoose";

export interface IAdmin {
  id_number: string;
  email?: string;
  password: string;
  name: string;
  course: string;
  year: string;
  position: string;
  status?: string;
  campus?: string;
  access: string;
  currentRefreshToken?: string | null;
}
//id_number, name, password, email, position, course, year, campus
export interface ICreateAdmin {
  id_number: string;
  name: string;
  password: string;
  email?: string;
  position: string;
  course: string;
  year: string;
  campus?: string;
}

export interface IAdminDocument extends IAdmin, Document {
  _id: mongoose.Types.ObjectId;
}
