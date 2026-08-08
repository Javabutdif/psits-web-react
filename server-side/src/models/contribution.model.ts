import mongoose, { Schema } from "mongoose";
import { IContributionDocument } from "./contribution.interface";

const contributionSchema = new Schema<IContributionDocument>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    memberType: {
      type: String,
      enum: ["admin", "student"],
    },
    idNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    type: {
      type: String,
      enum: ["developer", "media", "volunteer"],
      required: true,
    },
    githubUsername: {
      type: String,
    },
    commitCount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Contribution = mongoose.model<IContributionDocument>(
  "Contribution",
  contributionSchema
);