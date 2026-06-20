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
import { AppError } from "../util/app.error.util";

class HistoryService {
  //record membership history
  record = async (query: IHistory) => {
    return await new MembershipHistory(query).save();
  };
  //Get all membership history
  getAll = async () => {
    const history: IHistory[] = await MembershipHistory.find().sort({
      date: -1,
    });
    if (!history) {
      throw new AppError("No history found!", 404);
    }
    return history;
  };
}
const historyService = new HistoryService();
export { historyService };
