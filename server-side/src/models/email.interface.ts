import { Types } from "mongoose";
export interface IEmail {
  timestamp: Date;
  type: "receipt" | "forgot" | "auth" | "recruitment";
  studentId: Types.ObjectId;
  email: String;
  status: "pending" | "sent" | "failed";
  subtype?: string;
  referenceCode?: string;
  retryCount?: number;
}
