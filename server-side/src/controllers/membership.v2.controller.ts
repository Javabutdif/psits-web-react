import { Request, Response } from "express";
import { user_model } from "../model_template/model_data";
import mongoose from "mongoose";
import { settingsService } from "../services/settings.service";
import { studentService } from "../services/student.service";
import { IStudent } from "../models/student.interface";

import { membership_type } from "../enums/status.enums";
import { historyService } from "../services/history.service";
import { ISettings } from "../models/settings.interface";
import bcrypt from "bcryptjs";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";
import { Merch } from "../models/merch.model";
import { Orders } from "../models/orders.model";
import { Log } from "../models/log.model";
import { Settings } from "../models/settings.model";
import { MembershipHistory } from "../models/history.model";
import { format, startOfDay, endOfDay } from "date-fns";
import { admin_model, role_model } from "../model_template/model_data";
import { membershipRequestReceipt } from "../mail_template/mail.template";
import { IHistory } from "../models/history.interface";
import { IOrders } from "../models/orders.interface";
import { IAdmin, IAdminDocument } from "../models/admin.interface";
import { IMembershipRequest } from "../mail_template/mail.interface";
import { membershipService } from "../services/membership.service";

export const approveMembershipController = async (
  req: Request,
  res: Response
) => {
  const { reference_code, id_number, admin, rfid, date, cash } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
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
  } catch (error) {
    console.error("Internal server error:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const revokeAllMembershipController = async (
  req: Request,
  res: Response
) => {
  try {
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
  } catch (error) {
    console.error("Error revoking membership :", error);
    res.status(500).json("Internal Server Error");
  }
};

export const getMembershipHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const history = await historyService.getAll();
    if (!history) {
      res.status(401).json({ message: "No History" });
    }
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching membership history:", error);
    res.status(500).json("Internal Server Error");
  }
};

export const getMembershipRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const students = await membershipService.getPendingMembership();
    if (!students) {
      res.status(401).json({ message: "No students request" });
    }
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
};

export const getActiveMembershipCountController = async (res: Response) => {
  try {
    const response = await membershipService.getActiveMembershipCount();

    res.status(200).json({ message: response });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
