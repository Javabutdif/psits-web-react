import { Request, Response } from "express";
import { catchAsync } from "../util/catch.async.util";
import {
  getEmailQueueEntries,
  resendSingleEmail,
  getHealthStats,
  getDatabaseCounts,
  checkMongoConnection,
} from "../services/devtools.service";
import { emailService } from "../services/email.service";
import { resendPendingEmails } from "../services/email.resend.service";
import { checkPromos } from "../custom_function/check_promo";
import { orderService } from "../services/order.service";
import { campus_type } from "../enums/campus.enums";

const ALLOWED_CAMPUS = [campus_type.MAIN] as string[];

class DevToolsController {
  getEmailQueue = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { status, subtype } = req.query;
    const entries = await getEmailQueueEntries({
      status: status as string,
      subtype: subtype as string,
    });
    res.status(200).json({ data: entries });
  });

  resendSingleEmail = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { id } = req.params;
    await resendSingleEmail(id);
    await emailService.updateStatusById(id, "sent");
    res.status(200).json({ message: "Email resent successfully" });
  });

  getHealth = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const [stats, counts, mongoOk] = await Promise.all([
      getHealthStats(),
      getDatabaseCounts(),
      checkMongoConnection(),
    ]);
    res.status(200).json({
      data: { ...stats, mongoConnected: mongoOk, ...counts },
    });
  });

  getSessions = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { admin_model } = await import("../model_template/model_data");
    const admins = await require("../models/admin.model").Admin.find({
      currentRefreshToken: { $exists: true, $ne: null },
    }).lean();
    const students = await require("../models/student.model").Student.find({
      currentRefreshToken: { $exists: true, $ne: null },
    }).lean();

    const sessions = [
      ...admins.map((a: any) => ({
        id: a._id.toString(),
        name: a.name,
        idNumber: a.id_number,
        role: "admin",
        campus: a.campus,
        position: a.position,
      })),
      ...students.map((s: any) => ({
        id: s._id.toString(),
        name: `${s.first_name} ${s.last_name}`,
        idNumber: s.id_number,
        role: "student",
        campus: s.campus,
      })),
    ];

    res.status(200).json({ data: sessions });
  });

  clearExpiredSessions = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { Admin } = await import("../models/admin.model");
    const { Student } = await import("../models/student.model");
    const now = new Date();

    await Admin.updateMany(
      { currentRefreshToken: { $exists: true }, updatedAt: { $lt: now } },
      { $set: { currentRefreshToken: null } }
    );
    await Student.updateMany(
      { currentRefreshToken: { $exists: true }, updatedAt: { $lt: now } },
      { $set: { currentRefreshToken: null } }
    );

    res.status(200).json({ message: "Expired sessions cleared" });
  });

  invalidateSession = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { userId } = req.body;
    const { Admin } = await import("../models/admin.model");
    const { Student } = await import("../models/student.model");

    await Admin.findByIdAndUpdate(userId, { currentRefreshToken: null });
    await Student.findByIdAndUpdate(userId, { currentRefreshToken: null });

    res.status(200).json({ message: "Session invalidated" });
  });

  invalidateBulkSessions = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { userIds } = req.body;
    const { Admin } = await import("../models/admin.model");
    const { Student } = await import("../models/student.model");

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds is required" });
    }

    await Admin.updateMany(
      { _id: { $in: userIds } },
      { $set: { currentRefreshToken: null } }
    );
    await Student.updateMany(
      { _id: { $in: userIds } },
      { $set: { currentRefreshToken: null } }
    );

    res.status(200).json({ message: `${userIds.length} session(s) invalidated` });
  });

  triggerCron = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { type } = req.body;

    if (type === "email-resend") {
      await resendPendingEmails();
      res.status(200).json({ message: "Email resend job triggered" });
    } else if (type === "promo-check") {
      await checkPromos();
      res.status(200).json({ message: "Promo check triggered" });
    } else {
      res.status(400).json({ message: "Invalid cron type" });
    }
  });

  getExpiredOrders = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const orders = await orderService.getExpiredPendingOrders();
    res.status(200).json({ data: orders });
  });

  cancelExpiredOrders = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const result = await orderService.cancelExpiredOrders();
    res.status(200).json({
      message: `${result.cancelledCount} expired order(s) cancelled`,
      data: result,
    });
  });

  testEndpoint = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { path: endpointPath, method, body } = req.body;

    if (!endpointPath || !method) {
      return res.status(400).json({ message: "path and method are required" });
    }

    const allowedPaths = [
      "/api/v2/auth/login",
      "/api/v2/students",
      "/api/v2/orders",
      "/api/v2/events",
    ];

    if (!allowedPaths.includes(endpointPath)) {
      return res.status(400).json({ message: "Endpoint not allowed for testing" });
    }

    const axios = (await import("axios")).default;
    const baseUrl = process.env.BASE_URL || "http://localhost:3001";

    try {
      const response = await axios({
        url: `${baseUrl}${endpointPath}`,
        method: method.toLowerCase(),
        data: body,
        headers: {
          Authorization: `Bearer ${req.headers.authorization?.split(" ")[1]}`,
          "Content-Type": "application/json",
        },
      });

      res.status(200).json({
        data: response.data,
        status: response.status,
      });
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message,
      });
    }
  });
}

export const devtoolsController = new DevToolsController();
