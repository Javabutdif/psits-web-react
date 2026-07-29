// src/models/recruitmentPosition.model.ts

import { Schema, model, Document } from "mongoose";
import { hiringStatus } from "../enums/recruitment.enums";

export interface IRecruitmentPosition extends Document {
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  hiringStatus: keyof typeof hiringStatus;
  isActive: boolean;
  applicationDeadline?: Date;
  sortOrder: number;
  createdBy: string; // Reference to admin/user ID
  createdAt: Date;
  updatedAt: Date;
}

const RecruitmentPositionSchema = new Schema<IRecruitmentPosition>( {
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  responsibilities: { type: [String], required: true },
  requirements: { type: [String], required: true },
  hiringStatus: {
    type: String,
    enum: ['DRAFT', 'OPEN', 'CLOSED'],
    default: 'DRAFT',
    required: true,
  },
  isActive: { type: Boolean, default: true },
  applicationDeadline: Date,
  sortOrder: { type: Number, default: 0 },
  createdBy: { type: String, required: true },
}, { timestamps: true });

// Indexes for efficient querying
RecruitmentPositionSchema.index({ hiringStatus: 1 });
RecruitmentPositionSchema.index({ isActive: 1 });
RecruitmentPositionSchema.index({ applicationDeadline: 1 });
RecruitmentPositionSchema.index({ sortOrder: 1 });

const RecruitmentPosition = model<IRecruitmentPosition>("RecruitmentPosition", RecruitmentPositionSchema);

export { RecruitmentPosition };
