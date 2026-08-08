import { Types } from "mongoose";
export interface IEmail {
  timestamp: Date;
  type: "receipt" | "forgot" | "auth" | "recruitment" | "automation-report";
  studentId: Types.ObjectId;
  email: String;
  status: "pending" | "sent" | "failed";
  subtype?: string;
  referenceCode?: string;
  payload?: string;
  retryCount?: number;
}
