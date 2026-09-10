import mongoose, { Document } from "mongoose";

export interface IMembership {
  membership_name: string;
  start_date: Date;
  end_date: Date;
  term_name: string;
  is_active: boolean;
}

export interface IMembershipDocument extends IMembership, Document {
  _id: mongoose.Types.ObjectId;
}
