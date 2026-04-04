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

class HistoryService {
  //record membership history
  record = async (query: IHistory) => {
    try {
      return await new MembershipHistory(query).save();
    } catch (error) {
      return { success: false, message: "Error updating student", error };
    }
  };
  //Get all membership history
  getAll = async () => {
    try {
      const history: IHistory[] = await MembershipHistory.find().sort({
        date: -1,
      });
      if (!history) {
        return { status: false, message: "No history" };
      }
      return history;
    } catch (error) {
      return { status: false, message: "Server error" };
    }
  };
}
const historyService = new HistoryService();
export { historyService };
