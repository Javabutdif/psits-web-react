import mongoose, { Schema, Document } from "mongoose";

export interface ICronExecutionLog extends Document {
  jobName: string;
  scheduledAt: Date;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const cronExecutionLogSchema = new Schema<ICronExecutionLog>({
  jobName: { type: String, required: true, index: true },
  scheduledAt: { type: Date, required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  durationMs: { type: Number },
  success: { type: Boolean, required: true },
  errorMessage: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

cronExecutionLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const CronExecutionLog = mongoose.model<ICronExecutionLog>(
  "CronExecutionLog",
  cronExecutionLogSchema
);
