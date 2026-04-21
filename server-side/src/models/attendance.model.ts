import mongoose, { Document, Schema } from "mongoose";
import { IAttendance } from "./attendance.interface";

export interface IAttendanceDocument extends IAttendance, Document {}

const attendanceSessionEntrySchema = new Schema(
  {
    attended: { type: Boolean, default: false },
    timestamp: { type: Date, default: null },
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
    attendeeRef: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    id_number: {
      type: String,
      required: true,
      trim: true,
    },
    attendance: {
      type: new Schema(
        {
          morning: {
            type: attendanceSessionEntrySchema,
            default: () => ({ attended: false, timestamp: null }),
          },
          afternoon: {
            type: attendanceSessionEntrySchema,
            default: () => ({ attended: false, timestamp: null }),
          },
          evening: {
            type: attendanceSessionEntrySchema,
            default: () => ({ attended: false, timestamp: null }),
          },
        },
        { _id: false }
      ),
      required: true,
      default: () => ({
        morning: { attended: false, timestamp: null },
        afternoon: { attended: false, timestamp: null },
        evening: { attended: false, timestamp: null },
      }),
    },
    confirmedBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ event: 1, attendeeRef: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendanceDocument>(
  "attendance",
  attendanceSchema
);
