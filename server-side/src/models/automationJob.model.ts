import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAutomationJob extends Document {
  name: string;
  description?: string;
  targetType: "admin" | "role" | "permission";
  targetIds: string[];
  functionKeys: string[];
  schedule: {
    type: "daily" | "interval" | "weekly" | "cron";
    time: string;
    intervalDays?: number;
    dayOfWeek?: number;
    cronExpression?: string;
  };
  emailConfig: {
    enabled: boolean;
    subjectTemplate: string;
    includeSummary: boolean;
    includeRawData: boolean;
    useNoetix: boolean;
  };
  isActive: boolean;
  createdBy: Types.ObjectId;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["daily", "interval", "weekly", "cron"],
      required: true,
    },
    time: { type: String, required: true },
    intervalDays: { type: Number, min: 1 },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    cronExpression: { type: String },
  },
  { _id: false }
);

const automationJobSchema = new Schema<IAutomationJob>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    targetType: {
      type: String,
      enum: ["admin", "role", "permission"],
      required: true,
    },
    targetIds: { type: [String], default: [] },
    functionKeys: { type: [String], default: [], validate: { validator: (v: string[]) => v.length > 0, message: "At least one function required" } },
    schedule: { type: scheduleSchema, required: true },
    emailConfig: {
      enabled: { type: Boolean, default: true },
      subjectTemplate: { type: String, default: "{{jobName}} - {{date}}" },
      includeSummary: { type: Boolean, default: true },
      includeRawData: { type: Boolean, default: false },
      useNoetix: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

automationJobSchema.index({ isActive: 1, nextRunAt: 1 });

export const AutomationJob = mongoose.model<IAutomationJob>(
  "AutomationJob",
  automationJobSchema
);
