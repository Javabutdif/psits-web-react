import { ICart } from "./cart.interface";
import { ICartDocument } from "./cart.model";
import { Document } from "mongoose";
import mongoose from "mongoose";

export interface IStudent {
  id_number: string;
  rfid?: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  course: string;
  year: number;
  createdAt: Date;
  status: string;
  membershipStatus: string;
  applied?: string;
  campus: string;
  deletedBy: string;
  deletedDate: string;
  isFirstApplication: boolean;
  role: string;
  isRequest: boolean;
  adminRequest: string;
  cart: ICartDocument[];
  currentRefreshToken?: string | null;
}

export interface IStudentDocument extends IStudent, Document {
  _id: mongoose.Types.ObjectId;
}
