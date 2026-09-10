import mongoose from "mongoose";

export interface IHistory {
  membership_id?: mongoose.Types.ObjectId;
  id_number: string;
  rfid?: string;
  reference_code: string;
  type?: string;
  name?: string;
  year?: number;
  course?: string;
  date: Date;
  admin: string;
  total: number;
}
