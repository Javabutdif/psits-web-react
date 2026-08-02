import { Request, Response } from "express";
import { catchAsync } from "../util/catch.async.util";
import {
  getEmailQueueEntries,
  getEmailQueueCount,
  resendSingleEmail,
  getHealthStats,
  getDatabaseCounts,
  checkMongoConnection,
  getCronExecutionLogs,
  getEnvStatus,
  getRateLimitStats as getRateLimitStatsService,
  getCollectionStats,
  rebuildIndexes,
} from "../services/devtools.service";
import { emailService } from "../services/email.service";
import { resendPendingEmails } from "../services/email.resend.service";
import { checkPromos } from "../custom_function/check_promo";
import { orderService } from "../services/order.service";
import { campus_type } from "../enums/campus.enums";
import { logService } from "../services/log.service";
import { logs_action } from "../enums/logs.enums";

const ALLOWED_CAMPUS = [campus_type.MAIN] as string[];

class DevToolsController {
  getEmailQueue = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { status, subtype, limit, skip } = req.query;
    const entries = await getEmailQueueEntries({
      status: status as string,
      subtype: subtype as string,
      limit: limit ? parseInt(limit as string) : 100,
      skip: skip ? parseInt(skip as string) : 0,
    });
    const total = await getEmailQueueCount({
      status: status as string,
      subtype: subtype as string,
    });
    res.status(200).json({ data: entries, total });
  });

  exportEmailQueueCsv = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { status, subtype } = req.query;
    const entries = await getEmailQueueEntries({
      status: status as string,
      subtype: subtype as string,
      limit: 10000,
      skip: 0,
    });

    const headers = ["id", "type", "subtype", "email", "status", "referenceCode", "retryCount", "timestamp"];
    const csvRows = [headers.join(",")];

    for (const entry of entries) {
      const row = headers.map((h) => {
        const val = (entry as any)[h];
        const str = val === undefined || val === null ? "" : String(val);
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      });
      csvRows.push(row.join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=email-queue-${new Date().toISOString().split("T")[0]}.csv`);
    const csvAdminName = String(req.admin?.name ?? "");
    await logService.create({
      admin: csvAdminName || String(req.userV2?.idNumber ?? "") || "Unknown Admin",
      admin_id: req.admin?._id,
      action: logs_action.EXPORT_REPORT,
      target: "Email queue CSV",
      target_model: "Report",
    });
    res.status(200).send(csvRows.join("\n"));
  });

  resendSingleEmail = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { id } = req.params;
    await resendSingleEmail(id as string);
    await emailService.updateStatusById(id as string, "sent");
    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.RESEND_EMAIL,
      target: String(id),
      target_model: "Order",
    });
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
    const { role, campus } = req.query;

    const admins = await require("../models/admin.model").Admin.find({
      currentRefreshToken: { $exists: true, $ne: null },
    }).lean();

    const students = await require("../models/student.model").Student.find({
      currentRefreshToken: { $exists: true, $ne: null },
    }).lean();

    let adminList = admins.map((a: any) => ({
      id: a._id.toString(),
      name: a.name,
      idNumber: a.id_number,
      role: "admin",
      campus: a.campus,
      position: a.position,
    }));

    let studentList = students.map((s: any) => ({
      id: s._id.toString(),
      name: `${s.first_name} ${s.last_name}`,
      idNumber: s.id_number,
      role: "student",
      campus: s.campus,
    }));

    if (role === "admin") {
      adminList = adminList.filter((a: any) => !campus || a.campus === campus);
    } else if (role === "student") {
      studentList = studentList.filter((s: any) => !campus || s.campus === campus);
    } else {
      if (campus) {
        adminList = adminList.filter((a: any) => a.campus === campus);
        studentList = studentList.filter((s: any) => s.campus === campus);
      }
    }

    const sessions = [...adminList, ...studentList];

    res.status(200).json({ data: sessions });
  });

  clearExpiredSessions = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { Admin } = await import("../models/admin.model");
    const { Student } = await import("../models/student.model");
    const now = new Date();

    const adminResult = await Admin.updateMany(
      { currentRefreshToken: { $exists: true }, updatedAt: { $lt: now } },
      { $set: { currentRefreshToken: null } }
    );
    const studentResult = await Student.updateMany(
      { currentRefreshToken: { $exists: true }, updatedAt: { $lt: now } },
      { $set: { currentRefreshToken: null } }
    );
    const invalidatedCount =
      (adminResult.modifiedCount || 0) + (studentResult.modifiedCount || 0);

    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.CLEAR_EXPIRED_SESSIONS,
      target: `Cleared ${invalidatedCount} expired sessions`,
      target_model: "Admin",
    });

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

    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.INVALIDATE_SESSION,
      target: `Invalidated session for ${userId}`,
      target_model: "Admin",
    });

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

    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.INVALIDATE_SESSION_BULK,
      target: `Bulk invalidated ${userIds.length} sessions`,
      target_model: "Admin",
    });

    res.status(200).json({ message: `${userIds.length} session(s) invalidated` });
  });

  triggerCron = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { type } = req.body;

    if (type === "email-resend") {
      await resendPendingEmails();
      await logService.create({
        admin: req.admin.name,
        admin_id: req.admin._id,
        action: logs_action.TRIGGER_CRON,
        target: `Triggered cron job: ${type}`,
        target_model: "Order",
      });
      res.status(200).json({ message: "Email resend job triggered" });
    } else if (type === "promo-check") {
      await checkPromos();
      await logService.create({
        admin: req.admin.name,
        admin_id: req.admin._id,
        action: logs_action.TRIGGER_CRON,
        target: `Triggered cron job: ${type}`,
        target_model: "Merchandise",
      });
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
    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.CANCEL_EXPIRED_ORDERS,
      target: `Cancelled ${result.cancelledCount} expired order(s), restored ${result.restoredItems} item(s)`,
      target_model: "Order",
    });
    res.status(200).json({
      message: `${result.cancelledCount} expired order(s) cancelled`,
      data: result,
    });
  });

  getCronStatus = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { jobName } = req.query;
    const logs = await getCronExecutionLogs(
      jobName as string | undefined,
      parseInt((req.query.limit as string) || "20")
    );
    res.status(200).json({ data: logs });
  });

  getEnvStatus = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const status = getEnvStatus();
    res.status(200).json({ data: status });
  });

  getRateLimitStats = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const stats = getRateLimitStatsService();
    res.status(200).json({ data: stats });
  });

  getDbPerformance = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const stats = await getCollectionStats();
    res.status(200).json({ data: stats });
  });

  rebuildDbIndexes = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const result = await rebuildIndexes();
    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.REBUILD_DB_INDEXES,
      target: `Rebuilt indexes for ${result.collections?.length || 0} collection(s)`,
      target_model: "Admin",
    });
    res.status(200).json({ message: result.message, data: result.collections });
  });

  testEndpoint = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { path: endpointPath, method, body } = req.body;

    if (!endpointPath || !method) {
      return res.status(400).json({ message: "path and method are required" });
    }

    const allowedEndpoints: Record<string, "GET" | "POST"> = {
      "/api/v2/auth/login": "POST",
      "/api/v2/students": "GET",
      "/api/v2/orders": "GET",
      "/api/v2/events": "GET",
    };

    const normalizedMethod = method.toUpperCase() as "GET" | "POST";
    if (!allowedEndpoints[endpointPath] || allowedEndpoints[endpointPath] !== normalizedMethod) {
      return res.status(400).json({ message: "Endpoint/method not allowed for testing" });
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
