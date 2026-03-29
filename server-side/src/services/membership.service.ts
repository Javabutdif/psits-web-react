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

class MembershipService {
  //Check membership application
  checkApplication = async (student: IStudent) => {
    try {
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
      return result;
    } catch (error) {
      console.error("Membership checking error");
    }
  };
  //Revoke All Membership
  revokeMembership = async () => {
    try {
      const revokeMembership = await Student.updateMany({
        membershipStatus: "NOT_APPLIED",
      });

      if (!revokeMembership) {
        return { status: false, message: "Revoke Failed" };
      }

      return {
        status: true,
        message: "All Student Membership has been revoked  successfully",
      };
    } catch (error) {
      return { status: false, message: "Error revoking membership" };
    }
  };
  //Fetch all who've request the membership
  getPendingMembership = async () => {
    try {
      const students: IStudent[] = await Student.find({
        membershipStatus: membership_status.PENDING,
      });
      return students;
    } catch (error) {
      console.error("Server error");
    }
  };
}

const membershipService = new MembershipService();

export { membershipService };
