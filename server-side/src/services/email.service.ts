import { IEmail } from "../models/email.interface";
import { EmailQueue } from "../models/email.model";
import { Types } from "mongoose";
import { studentService } from "./student.service";
import { AppError } from "../util/app.error.util";
import { Type } from "@aws-sdk/client-s3";

class EmailService {
  //Create Queue email service
  create = async (type: String, studentId: Types.ObjectId) => {
    const student = await studentService.getSpecific({ _id: studentId });

    if (!student) {
      throw new AppError("No student found!", 404);
    }
    if (!student.email) {
      throw new AppError("No email found!", 404);
    }

    //Create
    await new EmailQueue({
      type,
      studentId,
      email: student.email,
    }).save();
  };
  //Create email queue by email directly
  createByEmail = async (type: string, email: string, subtype?: string, referenceCode?: string) => {
    return await new EmailQueue({
      type,
      studentId: new Types.ObjectId(),
      email,
      status: "pending",
      subtype,
      referenceCode,
    }).save();
  };
  //Update Email
  update = async (studentId: Types.ObjectId, status: String) => {
    await EmailQueue.findOneAndUpdate(
      { studentId },
      {
        $set: {
          status: status,
        },
      },
      { new: true }
    );
  };
  //Update status by queue entry id
  updateStatusById = async (id: string, status: string) => {
    return await EmailQueue.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
  };
  //Fetch emailqueue by receipt type
  fetchByReceipt = async () => {
    return await EmailQueue.find({
      type: "receipt",
      status: "pending",
    });
  };
}

export const emailService = new EmailService();
