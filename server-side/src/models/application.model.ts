// src/models/application.model.ts

import { Schema, model, Document, Types } from "mongoose";
import { applicationStatus, interviewStatus } from "../enums/recruitment.enums";
import { Admin } from "../models/admin.model";
import { Student } from "../models/student.model";

export interface IDocumentMetadata {
  storageKey: string;
  // Not stored anymore — resume URLs are short-lived signed URLs
  // generated on demand (see RecruitmentService.getResumeUrl), so this
  // can't be required/guaranteed to exist on the saved document.
  url?: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadTimestamp: Date;
}

export interface IInterview {
  scheduledAt?: Date;
  location?: string;
  notes?: string;
  status: keyof typeof interviewStatus;
  scheduledBy?: string; // Reference to admin/user ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IApplication extends Document {
  position: string; // Reference to RecruitmentPosition
  applicant: string | Types.ObjectId; // Reference to Student
  applicantSnapshot: {
    name: string;
    idNumber: string;
    email: string;
    course?: string;
    year?: string | number;
  };
  documents: {
    resume: IDocumentMetadata;
    applicationLetter: IDocumentMetadata;
  };
  status: keyof typeof applicationStatus;
  statusHistory: {
    status: keyof typeof applicationStatus;
    changedAt: Date;
    changedBy?: string;
    note?: string;
  }[];
  interview?: IInterview;
  reviewer?: string; // Reference to Admin who made decision
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    position: { type: String, required: true, ref: "RecruitmentPosition" },
    applicant: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Student",
    },
    applicantSnapshot: {
      name: { type: String, required: true },
      idNumber: { type: String, required: true },
      email: { type: String, required: true },
      course: { type: String, required: false },
      year: { type: Schema.Types.Mixed, required: false },
    },
    documents: {
      resume: {
        storageKey: { type: String, required: true },
        // Not stored anymore — resume URLs are short-lived signed URLs
        // generated on demand (see RecruitmentService.getResumeUrl), so
        // this can't be required at save time.
        url: { type: String, required: false },
        originalFilename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        uploadTimestamp: { type: Date, required: true },
      },
      // Future feature: Application Letter

      //applicationLetter: {
      // storageKey: { type: String, required: true },
      // originalFilename: { type: String, required: true },
      // mimeType: { type: String, required: true },
      // size: { type: Number, required: true },
      // uploadTimestamp: { type: Date, required: true },
      //},
    },
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEWING",
        "APPROVED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "SUBMITTED",
      required: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "SUBMITTED",
            "INTERVIEW_SCHEDULED",
            "INTERVIEWING",
            "APPROVED",
            "REJECTED",
            "WITHDRAWN",
          ],
          required: true,
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
        note: String,
      },
    ],
    interview: {
      scheduledAt: { type: Date },
      location: { type: String },
      notes: { type: String },
      status: { type: String },
      scheduledBy: { type: String },
      createdAt: { type: Date },
      updatedAt: { type: Date },
    },
    reviewer: String,
    internalNotes: String,
  },
  { timestamps: true }
);

// Unique compound index: one ACTIVE application per position per applicant.
// This is a partial index — REJECTED and WITHDRAWN applications are
// excluded from the uniqueness check, since submitApplication's app-level
// logic explicitly allows reapplying after rejection. Without the
// partialFilterExpression, MongoDB enforces uniqueness across ALL
// documents regardless of status, which silently blocked every
// reapplication attempt with an E11000 duplicate key error.
ApplicationSchema.index(
  { position: 1, applicant: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ["REJECTED", "WITHDRAWN"] },
    },
  }
);

// Indexes for admin querying
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ position: 1, status: 1 });
ApplicationSchema.index({ applicant: 1 });

const Application = model<IApplication>("Application", ApplicationSchema);

export { Application };
