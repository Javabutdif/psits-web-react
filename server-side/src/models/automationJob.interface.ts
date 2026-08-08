export interface IAutomationJob {
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
  };
  isActive: boolean;
  createdBy: import("mongoose").Types.ObjectId;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  createdAt: Date;
  updatedAt: Date;
}
