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
  //Number of active membership
  getActiveMembershipCount = async () => {
    try {
      const count = await Student.countDocuments({
        status: account_status.ACTIVE,
        $or: [
          { membershipStatus: membership_status.ACTIVE },
          { membershipStatus: membership_status.RENEWED },
        ],
      });
      return count;
    } catch (error) {
      console.error("Error fetching active membership count:", error);
      throw error;
    }
  };
  //Get Membership Price
  getMemberPrice = async () => {
    try {
      const settings = await Settings.findOne();

      return settings;
    } catch (error) {
      return { status: false, message: "Error fetching Membership Price" };
    }
  };
  //Change Membership Price
  changeMemberPrice = async (req: Request) => {
    const { price } = req.body;

    try {
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
    } catch (error) {
      console.error(error);
    }
  };
}

const membershipService = new MembershipService();

export { membershipService };
