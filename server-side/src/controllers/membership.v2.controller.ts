import { Request, Response } from "express";

import mongoose from "mongoose";
import { settingsService } from "../services/settings.service";
import { studentService } from "../services/student.service";
import { IStudent } from "../models/student.interface";

import { membership_type } from "../enums/status.enums";
import { historyService } from "../services/history.service";
import { ISettings } from "../models/settings.interface";

import { format } from "date-fns";
import { membershipRequestReceipt } from "../mail_template/mail.template";
import { IMembershipRequest } from "../mail_template/mail.interface";
import { membershipService } from "../services/membership.service";
import { catchAsync } from "../util/catch.async.util";

export const approveMembershipController = catchAsync(
  async (req: Request, res: Response) => {
    const { reference_code, id_number, admin, rfid, date, cash } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const settings: ISettings | null = await settingsService.config();

    if (!settings) {
      res.status(500).json({ message: "No membership price in the backend" });
    }
    const student: IStudent | null = await studentService.getIdSession(
      id_number,
      session
    );

    if (!student) {
      console.error(`Student with id_number ${id_number} not found.`);
      return res.status(404).json({ message: "Student not found" });
    }

    //check membership
    const result = await membershipService.checkApplication(student);

    const historyQuery = {
      id_number,
      rfid,
      reference_code,
      type: student.isFirstApplication
        ? membership_type.MEMBER
        : membership_type.RENEWAL,
      name: studentService.fullNameFormat(student),
      year: student.year,
      course: student.course,
      date: new Date(),
      admin: admin ? admin : req.admin.name,
      total: settings?.membership_price || 0,
    };

    const savedHistory = await historyService.record(historyQuery);

    if (!savedHistory) {
      console.error("Failed to save membership history.");

      return res
        .status(500)
        .json({ message: "Failed to save membership history" });
    }
    await session.commitTransaction();
    session.endSession();

    const data: IMembershipRequest = {
      name: studentService.fullNameFormat(student),
      reference_code,
      cash: cash ?? 50,
      total: settings?.membership_price ?? 0,
      course: student.course,
      year: student.year,
      admin: admin ?? req.admin.name,
      date: format(new Date(), "MMMM d, yyyy"),
      change: (cash ?? 50) - (cash ?? 50),
    };

    // Call the reusable receipt function
    await membershipRequestReceipt(data, student?.email ?? "");

    return res
      .status(200)
      .json({ message: "Membership approved successfully" });
  }
);

export const revokeAllMembershipController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await membershipService.revokeMembership();
    if (result.status) {
      res.status(200).json({
        message: result.message,
      });
    } else {
      res.status(404).json({
        message: result.message,
      });
    }
  }
);

export const getMembershipHistoryController = catchAsync(
  async (req: Request, res: Response) => {
    const history = await historyService.getAll();
    if (!history) {
      res.status(401).json({ message: "No History" });
    }
    res.status(200).json(history);
  }
);

export const getMembershipRequestController = catchAsync(
  async (req: Request, res: Response) => {
    const students = await membershipService.getPendingMembership();
    if (!students) {
      res.status(401).json({ message: "No students request" });
    }
    res.status(200).json(students);
  }
);

export const getActiveMembershipCountController = catchAsync(
  async (req: Request, res: Response) => {
    const response = await membershipService.getActiveMembershipCount();

    res.status(200).json({ message: response });
  }
);
