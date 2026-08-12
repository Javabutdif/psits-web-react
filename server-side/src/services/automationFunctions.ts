import { Merch } from "../models/merch.model";
import { Orders } from "../models/orders.model";
import { Student } from "../models/student.model";
import { Event } from "../models/event.model";
import { Application } from "../models/application.model";
import { MembershipHistory } from "../models/history.model";
import { EmailQueue } from "../models/email.model";
import { Refund } from "../models/refund.model";
import { CertificateServiceV2 } from "./certificateV2.service";
import { hydrateEventsAttendance } from "./attendance.service";
import { promoService } from "./promo.service";
import { getRateLimitViolations, getBruteForceLogs, getHealthStats, getDatabaseCounts } from "./devtools.service";
import { account_status } from "../enums/status.enums";
import { applicationStatus } from "../enums/recruitment.enums";

export interface AutomationFunctionResult {
  success: boolean;
  data?: unknown;
  recordCount: number;
  durationMs: number;
  error?: string;
  functionKey?: string;
  category?: "inventory" | "orders" | "members" | "events" | "system" | "security";
  description?: string;
}

export interface AutomationFunctionDef {
  fn: (params?: Record<string, unknown>) => Promise<unknown>;
  defaultParams: Record<string, unknown>;
  description: string;
  category: "inventory" | "orders" | "members" | "events" | "system" | "security";
}

// ─── Inventory Functions ───────────────────────────────────────────────

const getStockAlertsFn = async (): Promise<unknown> => {
  const threshold = 5;
  const items = await Merch.find({
    stocks: { $lte: threshold },
    is_active: true,
  }).lean();
  return items.map((item: any) => ({
    name: item.name,
    stocks: item.stocks,
    price: item.price,
    category: item.category,
    warning: item.stocks === 0 ? "Out of stock" : "Low stock",
  }));
};

const getLowStockCountFn = async (): Promise<unknown> => {
  const threshold = 5;
  const count = await Merch.countDocuments({
    stocks: { $lte: threshold },
    is_active: true,
  });
  return { count, threshold };
};

const getInactiveMerchFn = async (): Promise<unknown> => {
  const daysNoSales = 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysNoSales);
  const items = await Merch.find({
    is_active: true,
    $or: [
      { "order_details.0": { $exists: false } },
      {
        "order_details.0.transaction_date": { $lt: cutoff },
      },
    ],
  }).lean();
  return items.map((item: any) => ({
    name: item.name,
    category: item.category,
    lastSale: item.order_details?.length
      ? item.order_details[item.order_details.length - 1].transaction_date
      : "No sales",
  }));
};

// ─── Orders Functions ──────────────────────────────────────────────────

const getPendingOrdersFn = async (): Promise<unknown> => {
  const limit = 50;
  const orders = await Orders.find({ order_status: "Pending" })
    .sort({ order_date: -1 })
    .limit(limit)
    .lean();
  return orders.map((o: any) => ({
    reference_code: o.reference_code,
    student_name: o.student_name,
    id_number: o.id_number,
    total: o.total,
    order_date: o.order_date,
    items_count: o.items?.length ?? 0,
  }));
};

const getExpiredOrdersFn = async (): Promise<unknown> => {
  const daysOld = 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  const orders = await Orders.find({
    order_status: "Pending",
    order_date: { $lt: cutoff },
  }).lean();
  return orders.map((o: any) => ({
    reference_code: o.reference_code,
    student_name: o.student_name,
    order_date: o.order_date,
    daysExpired: Math.floor((Date.now() - new Date(o.order_date).getTime()) / 86400000),
  }));
};

const getRefundQueueFn = async (): Promise<unknown> => {
  const refunds = await Refund.find()
    .sort({ refund_date: -1 })
    .limit(50)
    .lean();
  return refunds.map((r: any) => ({
    refund_id: r.refund_id,
    order_reference: r.order_reference,
    product_name: r.product_name,
    refund_price: r.refund_price,
    refund_date: r.refund_date,
    status: r.status,
  }));
};

// ─── Members Functions ─────────────────────────────────────────────────

  const getPendingApplicationsFn = async (): Promise<unknown> => {
  const applications = await Application.find({
    status: applicationStatus.SUBMITTED,
  })
    .populate("position", "title")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return applications.map((a: any) => ({
    applicant_name: a.applicantSnapshot?.name || "N/A",
    id_number: a.applicantSnapshot?.idNumber || "N/A",
    position: a.position?.title || "N/A",
    submittedAt: a.createdAt,
  }));
};

const getPendingMembershipsFn = async (): Promise<unknown> => {
  const students = await Student.find({
    membershipStatus: "PENDING",
    status: account_status.ACTIVE,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return students.map((s: any) => ({
    name: `${s.first_name} ${s.last_name}`,
    id_number: s.id_number,
    course: s.course,
    year: s.year,
    campus: s.campus,
    requestedAt: s.createdAt,
  }));
};

const getNewStudentsFn = async (): Promise<unknown> => {
  const sinceDays = 7;
  const since = new Date();
  since.setDate(since.getDate() - sinceDays);
  const students = await Student.find({
    createdAt: { $gte: since },
    status: account_status.ACTIVE,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return students.map((s: any) => ({
    name: `${s.first_name} ${s.last_name}`,
    id_number: s.id_number,
    course: s.course,
    year: s.year,
    campus: s.campus,
  }));
};

// ─── Events Functions ──────────────────────────────────────────────────

const getEventAttendanceStatsFn = async (): Promise<unknown> => {
  const upcomingDays = 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + upcomingDays);
  const events = await Event.find({
    eventDate: { $lte: cutoff },
  })
    .sort({ eventDate: 1 })
    .limit(20)
    .lean();

  if (events.length === 0) return [];

  const hydrated = await hydrateEventsAttendance(events as any);
  return (hydrated as any[]).map((event: any) => {
    const totalAttendees = event.attendees?.length ?? 0;
    const attended = (event.attendees ?? []).filter(
      (a: any) => a.attendance?.morning?.attended || a.attendance?.afternoon?.attended || a.attendance?.evening?.attended
    ).length;
    const rate = totalAttendees > 0 ? Math.round((attended / totalAttendees) * 100) : 0;
    return {
      event_name: event.eventName,
      event_date: event.eventDate,
      total_expected: totalAttendees,
      total_attended: attended,
      attendance_rate: `${rate}%`,
    };
  });
};

const getAttendanceGapsFn = async (): Promise<unknown> => {
  const thresholdPercent = 50;
  const events = await Event.find().sort({ eventDate: -1 }).limit(20).lean();

  if (events.length === 0) return [];

  const hydrated = await hydrateEventsAttendance(events as any);
  const gaps: any[] = [];
  for (const event of hydrated as any[]) {
    const totalAttendees = event.attendees?.length ?? 0;
    if (totalAttendees === 0) continue;
    const attended = (event.attendees ?? []).filter(
      (a: any) => a.attendance?.morning?.attended || a.attendance?.afternoon?.attended || a.attendance?.evening?.attended
    ).length;
    const rate = Math.round((attended / totalAttendees) * 100);
    if (rate < thresholdPercent) {
      gaps.push({
        event_name: event.eventName,
        attendance_rate: `${rate}%`,
        threshold: `${thresholdPercent}%`,
      });
    }
  }
  return gaps;
};

const getCertificateEligibilityFn = async (): Promise<unknown> => {
  const events = await Event.find({ isGenerateCertificate: true }).lean();
  return (events as any[]).map((event: any) => ({
    event_name: event.eventName,
    eligible_count: event.eligibleStudentsForCertificate?.length ?? 0,
  }));
};

// ─── System Functions ──────────────────────────────────────────────────

const getRevenueSummaryFn = async (): Promise<unknown> => {
  const periodDays = 30;
  const since = new Date();
  since.setDate(since.getDate() - periodDays);
  const [membershipResult, orderResult] = await Promise.all([
    MembershipHistory.aggregate([
      { $match: { date: { $gte: since } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Orders.aggregate([
      { $match: { order_status: "Paid", transaction_date: { $gte: since } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
  ]);
  const membership = membershipResult[0] || { total: 0, count: 0 };
  const orders = orderResult[0] || { total: 0, count: 0 };
  return {
    membership: { total: membership.total, count: membership.count },
    merch: { total: orders.total, count: orders.count },
    total: membership.total + orders.total,
    period: `${periodDays} days`,
  };
};

const getEmailQueueStatsFn = async (): Promise<unknown> => {
  const [total, pending, sent, failed] = await Promise.all([
    EmailQueue.countDocuments(),
    EmailQueue.countDocuments({ status: "pending" }),
    EmailQueue.countDocuments({ status: "sent" }),
    EmailQueue.countDocuments({ status: "failed" }),
  ]);
  return { total, pending, sent, failed };
};

const getFailedEmailsFn = async (): Promise<unknown> => {
  const entries = await EmailQueue.find({ status: "failed" })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();
  const now = new Date();
  return entries.map((e: any) => ({
    email: e.email,
    type: e.type,
    subtype: e.subtype,
    retryCount: e.retryCount,
    daysPending: Math.floor((now.getTime() - new Date(e.timestamp).getTime()) / 86400000),
  }));
};

const getSystemHealthFn = async (): Promise<unknown> => {
  const health = await getHealthStats();
  const counts = await getDatabaseCounts();
  return { ...health, ...counts };
};

const getPromoUsageFn = async (): Promise<unknown> => {
  const promos = await promoService.fetchAll();
  return promos.map((p: any) => ({
    name: p.promo_name,
    type: p.type,
    discount: p.discount,
    quantity: p.quantity,
  }));
};

const getActiveAdminsFn = async (): Promise<unknown> => {
  const admins = await require("../models/admin.model").Admin.find({
    currentRefreshToken: { $exists: true, $ne: null },
    status: account_status.ACTIVE,
  }).lean();
  return admins.map((a: any) => ({
    name: a.name,
    id_number: a.id_number,
    position: a.position,
    campus: a.campus,
    lastActive: a.updatedAt,
  }));
};

// ─── Security Functions ────────────────────────────────────────────────

const getRateLimitViolationsFn = async (): Promise<unknown> => {
  const violations = getRateLimitViolations(50);
  return violations.map((v: any) => ({
    ip: v.ip,
    path: v.path,
    timestamp: v.timestamp,
  }));
};

const getBruteForceAttemptsFn = async (): Promise<unknown> => {
  const logs = getBruteForceLogs(5, 20);
  return logs.map((l: any) => ({
    ip: l.ip,
    count: l.count,
    lastAttempt: l.lastAttempt,
  }));
};

// ─── Registry ──────────────────────────────────────────────────────────

export const AUTOMATION_FUNCTIONS: Record<string, AutomationFunctionDef> = {
  // Inventory
  getStockAlerts: {
    fn: getStockAlertsFn,
    defaultParams: { threshold: 5 },
    description: "Items at or below stock threshold (≤5)",
    category: "inventory",
  },
  getLowStockCount: {
    fn: getLowStockCountFn,
    defaultParams: { threshold: 5 },
    description: "Count of low-stock active items",
    category: "inventory",
  },
  getInactiveMerch: {
    fn: getInactiveMerchFn,
    defaultParams: { daysNoSales: 30 },
    description: "Active merchandise with no sales in 30 days",
    category: "inventory",
  },
  // Orders
  getPendingOrders: {
    fn: getPendingOrdersFn,
    defaultParams: { limit: 50 },
    description: "Pending orders awaiting payment/fulfillment",
    category: "orders",
  },
  getExpiredOrders: {
    fn: getExpiredOrdersFn,
    defaultParams: { daysOld: 7 },
    description: "Orders past expiry (cancellable)",
    category: "orders",
  },
  getRefundQueue: {
    fn: getRefundQueueFn,
    defaultParams: { status: "pending" },
    description: "Pending refund requests",
    category: "orders",
  },
  // Members
  getPendingApplications: {
    fn: getPendingApplicationsFn,
    defaultParams: { status: "SUBMITTED" },
    description: "Recruitment applications awaiting review",
    category: "members",
  },
  getPendingMemberships: {
    fn: getPendingMembershipsFn,
    defaultParams: {},
    description: "Students with PENDING membership status",
    category: "members",
  },
  getNewStudents: {
    fn: getNewStudentsFn,
    defaultParams: { sinceDays: 7 },
    description: "Students registered in the last 7 days",
    category: "members",
  },
  // Events
  getEventAttendanceStats: {
    fn: getEventAttendanceStatsFn,
    defaultParams: { upcomingDays: 30 },
    description: "Attendance rates for upcoming events",
    category: "events",
  },
  getAttendanceGaps: {
    fn: getAttendanceGapsFn,
    defaultParams: { thresholdPercent: 50 },
    description: "Events with attendance below 50%",
    category: "events",
  },
  getCertificateEligibility: {
    fn: getCertificateEligibilityFn,
    defaultParams: {},
    description: "Students eligible for certificates not yet generated",
    category: "events",
  },
  // System
  getRevenueSummary: {
    fn: getRevenueSummaryFn,
    defaultParams: { periodDays: 30 },
    description: "Membership + merch revenue summary",
    category: "system",
  },
  getEmailQueueStats: {
    fn: getEmailQueueStatsFn,
    defaultParams: {},
    description: "Email queue health (pending/failed/sent counts)",
    category: "system",
  },
  getFailedEmails: {
    fn: getFailedEmailsFn,
    defaultParams: { limit: 50 },
    description: "Failed emails with retry details",
    category: "system",
  },
  getSystemHealth: {
    fn: getSystemHealthFn,
    defaultParams: {},
    description: "Server uptime, memory, and DB connectivity",
    category: "system",
  },
  getPromoUsage: {
    fn: getPromoUsageFn,
    defaultParams: {},
    description: "Promo code redemption statistics",
    category: "system",
  },
  getActiveAdmins: {
    fn: getActiveAdminsFn,
    defaultParams: {},
    description: "Admins with active sessions",
    category: "system",
  },
  // Security
  getRateLimitViolations: {
    fn: getRateLimitViolationsFn,
    defaultParams: { hours: 24 },
    description: "Recent rate limit violations",
    category: "security",
  },
  getBruteForceAttempts: {
    fn: getBruteForceAttemptsFn,
    defaultParams: { threshold: 5 },
    description: "IPs with repeated failed login attempts",
    category: "security",
  },
};
