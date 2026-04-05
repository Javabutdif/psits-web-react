import { Request, Response } from "express";
import mongoose from "mongoose";
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
import { IMembershipRequest } from "../mail_template/mail.interface";
import { IStudent } from "../models/student.interface";
import { IHistory } from "../models/history.interface";
import { IOrders } from "../models/orders.interface";
import { IAdmin, IAdminDocument } from "../models/admin.interface";
import { user_model } from "../model_template/model_data";
import { account_status, membership_status } from "../enums/status.enums";
import { studentService } from "./student.service";
import { AppError } from "../util/app.error.util";

class MembershipService {
  //Check membership application
  checkApplication = async (student: IStudent) => {
    let updateQuery = {};
    if (student.isFirstApplication) {
      updateQuery = {
        membershipStatus: membership_status.ACTIVE,
        rfid: student.rfid,
        isFirstApplication: false,
      };
    } else {
      updateQuery = {
        membershipStatus: membership_status.RENEWED,
      };
    }

    const result = await studentService.updateOneDynamic(
      student.id_number,
      updateQuery
    );
    if (!result) {
      throw new AppError("Did not update the student", 404);
    }
    return result;
  };
  //Revoke All Membership
  revokeMembership = async () => {
    const revokeMembership = await Student.updateMany({
      membershipStatus: "NOT_APPLIED",
    });

    if (!revokeMembership) {
      throw new AppError("Cannot revoke membership", 404);
    }

    return {
      status: true,
      message: "All Student Membership has been revoked successfully",
    };
  };
  //Fetch all who've request the membership
  getPendingMembership = async () => {
    const students: IStudent[] = await studentService.getAllStudents({
      membershipStatus: membership_status.PENDING,
    });
    if (!students) {
      throw new AppError("No student found", 404);
    }
    return students;
  };
  //Number of active membership
  getActiveMembershipCount = async () => {
    const count = await Student.countDocuments({
      status: account_status.ACTIVE,
      $or: [
        { membershipStatus: membership_status.ACTIVE },
        { membershipStatus: membership_status.RENEWED },
      ],
    });
    if (!count) {
      throw new AppError("No count!", 404);
    }
    return count;
  };
  //Get Membership Price
  getMemberPrice = async () => {
    const settings = await Settings.findOne();
    if (!settings) {
      throw new AppError("No settings available", 404);
    }
    return settings;
  };
  //Change Membership Price
  changeMemberPrice = async (req: Request) => {
    const { price } = req.body;

    const settings = await Settings.find();
    if (settings.length === 0) {
      await new Settings({
        membership_price: price,
      }).save();
      await new Settings({ membership_price: price }).save();
      return { status: true, message: "Membership fee created" };
    }
    const update = await Settings.updateOne(
      {},
      {
        $set: {
          membership_price: price,
        },
      }
    );
    if (update.matchedCount > 0) {
      return { status: true, message: "Memberhsip Fee Updated" };
    } else {
      return { status: false, message: "Error updating fee" };
    }
  };
}

const membershipService = new MembershipService();

export { membershipService };
