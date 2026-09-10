import mongoose, { Schema, Document } from "mongoose";
import { IMembership } from "./membership.interface";
import { membership_term } from "../enums/status.enums";

export interface IMembershipDocument extends IMembership, Document {}

const membershipSchema = new Schema<IMembershipDocument>({
  membership_name: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  term_name: {
    type: String,
    required: true,
    enums: [membership_term.FIRST, membership_term.SECOND],
  },
  is_active: {
    type: Boolean,
    default: false,
    index: true,
  },
});

export const Membership = mongoose.model<IMembershipDocument>(
  "Membership",
  membershipSchema
);
