import { Types } from "mongoose";
import { IAttendanceSession } from "./attendee.interface";

export interface IAttendance {
  event: Types.ObjectId;
  attendeeRef: Types.ObjectId;
  id_number: string;
  attendance: IAttendanceSession;
  confirmedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}
