import { Types } from "mongoose";
export interface IEmail {
  timestamp: Date;
  type: "receipt" | "forgot";
  studentId: Types.ObjectId;
  email: String;
  status: "pending" | "sent";
  subtype?: string;
  referenceCode?: string;
}
