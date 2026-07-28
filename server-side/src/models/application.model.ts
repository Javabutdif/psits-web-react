// src/models/application.model.ts

import { Schema, model, Document } from "mongoose";
import { applicationStatus, interviewStatus } from "../enums/recruitment.enums";
import { Admin } from "../models/admin.model";
import { Student } from "../models/student.model";

export interface IDocumentMetadata {
  storageKey: string;
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
  applicant: string; // Reference to Student
  applicantSnapshot: {
    name: string;
    idNumber: string;
    email: string;
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

const ApplicationSchema = new Schema<IApplication>( {
   position: { type: String, required: true, ref: "RecruitmentPosition" },
   applicant: { type: String, required: true, ref: "Student" },
   applicantSnapshot: {
     name: { type: String, required: true },
     idNumber: { type: String, required: true },
     email: { type: String, required: true },
   },
   documents: {
     resume: {
       storageKey: { type: String, required: true },
       originalFilename: { type: String, required: true },
       mimeType: { type: String, required: true },
       size: { type: Number, required: true },
       uploadTimestamp: { type: Date, required: true },
     },
     applicationLetter: {
       storageKey: { type: String, required: true },
       originalFilename: { type: String, required: true },
       mimeType: { type: String, required: true },
       size: { type: Number, required: true },
       uploadTimestamp: { type: Date, required: true },
     },
   },
   status: {
     type: String,
     enum: ['SUBMITTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
     default: 'SUBMITTED',
     required: true,
   },
   statusHistory: [{
     status: { 
       type: String, 
       enum: ['SUBMITTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
       required: true 
     },
     changedAt: { type: Date, default: Date.now },
     changedBy: String,
     note: String,
   }],
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
}, { timestamps: true });

// Unique compound index: one active application per position per applicant
ApplicationSchema.index({ position: 1, applicant: 1 }, { unique: true });

// Indexes for admin querying
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ position: 1, status: 1 });
ApplicationSchema.index({ applicant: 1 });

const Application = model<IApplication>("Application", ApplicationSchema);

export { Application };
