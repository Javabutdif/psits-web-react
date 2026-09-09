import { Merch } from "../models/merch.model";
import { Orders } from "../models/orders.model";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";
import { Event } from "../models/event.model";
import { Application } from "../models/application.model";
import { RecruitmentPosition } from "../models/recruitmentPosition.model";
import { MembershipHistory } from "../models/history.model";
import { Log } from "../models/log.model";
import { Contribution } from "../models/contribution.model";
import { Promo } from "../models/promo.model";
import { PromoUsage } from "../models/promo.usage.model";
import { hydrateEventsAttendance } from "./attendance.service";
import { computeEventStatistics } from "./eventStatistics.service";
import { getMerchandiseReport } from "./report.service";
import { getNoetixUsageStats } from "./noetix-usage.service";
import {
  getRateLimitViolations,
  getBruteForceLogs,
  getHealthStats,
  getDatabaseCounts,
  getStockAlerts,
  getRefundQueue,
  getEmailQueueStats,
  getFailedEmailDetails,
  getMembershipRevenue,
  getCronExecutionLogs,
  getCollectionStats,
  getErrors,
  getEnvStatus,
  getSystemSettings,
} from "./devtools.service";
import { account_status } from "../enums/status.enums";
import {
  applicationStatus,
  hiringStatus,
  interviewStatus,
} from "../enums/recruitment.enums";
import { logs_action } from "../enums/logs.enums";
import { ACTIVE_STATUSES, PENDING_STATUSES } from "../util/membership.util";

export type AutomationCategory =
  | "inventory"
  | "orders"
  | "members"
  | "events"
  | "system"
  | "security";

/** Params passed to an automation function, sourced from its registry `defaultParams`. */
export type AutomationParams = Record<string, unknown>;

export interface AutomationFunctionResult {
  success: boolean;
  data?: unknown;
  recordCount: number;
  durationMs: number;
  error?: string;
  functionKey?: string;
  category?: AutomationCategory;
  description?: string;
}

export interface AutomationFunctionDef {
  fn: (params?: AutomationParams) => Promise<unknown>;
  defaultParams: AutomationParams;
  description: string;
  category: AutomationCategory;
}

// ─── Param Helpers ─────────────────────────────────────────────────────
//
// Every function reads its thresholds from `params`, falling back to the
// registry's `defaultParams`. Before this, params were passed but ignored.

/** Results are JSON-stringified into report emails, so every list is capped. */
const MAX_LIMIT = 500;

const toNumber = (value: unknown, fallback: number): number => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const numParam = (
  params: AutomationParams | undefined,
  key: string,
  fallback: number
): number => toNumber(params?.[key], fallback);

const limitParam = (
  params: AutomationParams | undefined,
  fallback = 50
): number => {
  const value = Math.trunc(numParam(params, "limit", fallback));
  return Math.min(Math.max(value, 1), MAX_LIMIT);
};

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const daysAhead = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/** Whole days between `value` and now; null when missing or unparseable. */
const daysSince = (value: unknown): number | null => {
  if (!value) return null;
  const time = new Date(value as string).getTime();
  if (Number.isNaN(time)) return null;
  return Math.floor((Date.now() - time) / 86400000);
};

const daysUntil = (value: unknown): number | null => {
  if (!value) return null;
  const time = new Date(value as string).getTime();
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / 86400000);
};

const percent = (part: number, whole: number): number =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

// ─── Inventory Functions ───────────────────────────────────────────────

const getStockAlertsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const threshold = numParam(params, "threshold", 5);
  const alerts = await getStockAlerts(threshold);
  // devtools' helper spans inactive merch too; automation reports only live stock.
  return alerts
    .filter((item) => item.is_active)
    .map((item) => ({
      name: item.name,
      stocks: item.stocks,
      price: item.price,
      category: item.category,
      warning: item.warning,
    }));
};

const getLowStockCountFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const threshold = numParam(params, "threshold", 5);
  const count = await Merch.countDocuments({
    stocks: { $lte: threshold },
    is_active: true,
  });
  return { count, threshold };
};

const getInactiveMerchFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const daysNoSales = numParam(params, "daysNoSales", 30);
  const limit = limitParam(params, 50);

  // order_details.transaction_date is stored as a String, so it cannot be
  // compared against a Date in the query — BSON sorts every string before every
  // date, which silently matched all merch. Filter in JS instead.
  const items = await Merch.find({ is_active: true })
    .select("name category order_details")
    .lean();

  return items
    .map((item: any) => {
      const details = item.order_details ?? [];
      const lastSale = details.length
        ? details[details.length - 1].transaction_date
        : null;
      return { item, lastSale, age: daysSince(lastSale) };
    })
    .filter(({ age }) => age === null || age >= daysNoSales)
    .slice(0, limit)
    .map(({ item, lastSale, age }) => ({
      name: item.name,
      category: item.category,
      lastSale: lastSale ?? "No sales",
      daysSinceLastSale: age,
    }));
};

const getExpiringMerchFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const withinDays = numParam(params, "withinDays", 7);
  const limit = limitParam(params, 50);
  const items = await Merch.find({
    is_active: true,
    end_date: { $gte: new Date(), $lte: daysAhead(withinDays) },
  })
    .sort({ end_date: 1 })
    .limit(limit)
    .lean();

  return items.map((item: any) => ({
    name: item.name,
    category: item.category,
    stocks: item.stocks,
    end_date: item.end_date,
    daysRemaining: daysUntil(item.end_date),
  }));
};

const getTopSellingMerchFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 10);
  const items = await Merch.find({ "sales_data.unitsSold": { $gt: 0 } })
    .select("name category stocks is_active sales_data")
    .sort({ "sales_data.totalRevenue": -1 })
    .limit(limit)
    .lean();

  return items.map((item: any) => ({
    name: item.name,
    category: item.category,
    unitsSold: item.sales_data?.unitsSold ?? 0,
    totalRevenue: item.sales_data?.totalRevenue ?? 0,
    stocks: item.stocks,
    is_active: item.is_active,
  }));
};

const getStockValuationFn = async (): Promise<unknown> => {
  const [result] = await Merch.aggregate([
    { $match: { is_active: true } },
    {
      $group: {
        _id: null,
        productCount: { $sum: 1 },
        totalUnits: { $sum: "$stocks" },
        totalValue: { $sum: { $multiply: ["$stocks", "$price"] } },
      },
    },
  ]);

  return {
    productCount: result?.productCount ?? 0,
    totalUnits: result?.totalUnits ?? 0,
    totalValue: Math.round((result?.totalValue ?? 0) * 100) / 100,
  };
};

// ─── Orders Functions ──────────────────────────────────────────────────

const getPendingOrdersFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
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

const getExpiredOrdersFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const daysOld = numParam(params, "daysOld", 7);
  const limit = limitParam(params, 50);
  const orders = await Orders.find({
    order_status: "Pending",
    order_date: { $lt: daysAgo(daysOld) },
  })
    .sort({ order_date: 1 })
    .limit(limit)
    .lean();
  return orders.map((o: any) => ({
    reference_code: o.reference_code,
    student_name: o.student_name,
    order_date: o.order_date,
    daysExpired: daysSince(o.order_date),
  }));
};

const getRefundQueueFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  const refunds = await getRefundQueue(limit);
  // The Refund model has no status field — every row here is a processed refund.
  return refunds.map((r) => ({
    refund_id: r.refund_id,
    order_reference: r.order_reference,
    product_name: r.product_name,
    refund_price: r.refund_price,
    refund_admin: r.refund_admin,
    refund_date: r.refund_date,
  }));
};

const getOrdersSummaryFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const periodDays = numParam(params, "periodDays", 7);
  const since = daysAgo(periodDays);

  const [pending, paid, refunded, revenue] = await Promise.all([
    Orders.countDocuments({ order_status: "Pending" }),
    Orders.countDocuments({
      order_status: "Paid",
      transaction_date: { $gte: since },
    }),
    Orders.countDocuments({
      order_status: "Refunded",
      transaction_date: { $gte: since },
    }),
    Orders.aggregate([
      { $match: { order_status: "Paid", transaction_date: { $gte: since } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
  ]);

  const totals = revenue[0] ?? { total: 0, count: 0 };
  return {
    period: `${periodDays} days`,
    pendingAllTime: pending,
    paidInPeriod: paid,
    refundedInPeriod: refunded,
    revenueInPeriod: totals.total,
    averageOrderValue:
      totals.count > 0
        ? Math.round((totals.total / totals.count) * 100) / 100
        : 0,
  };
};

const getMerchandiseReportSummaryFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 10);
  const report = await getMerchandiseReport({ limit });
  return {
    unitsSold: report.summary.unitsSold,
    totalRevenue: report.summary.totalRevenue,
    rowCount: report.total,
    topRows: report.rows.slice(0, limit),
  };
};

// ─── Members Functions ─────────────────────────────────────────────────

const studentRow = (s: any) => ({
  name: `${s.first_name} ${s.last_name}`,
  id_number: s.id_number,
  course: s.course,
  year: s.year,
  campus: s.campus,
});

const getPendingApplicationsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  const applications = await Application.find({
    status: applicationStatus.SUBMITTED,
  })
    .populate("position", "title")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return applications.map((a: any) => ({
    applicant_name: a.applicantSnapshot?.name || "N/A",
    id_number: a.applicantSnapshot?.idNumber || "N/A",
    position: a.position?.title || "N/A",
    submittedAt: a.createdAt,
  }));
};

const getPendingMembershipsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  // membershipStatus is written in two formats across the v1 and v2 controllers
  // ("PENDING" vs "MEMBERSHIP_PENDING") — match both.
  const students = await Student.find({
    membershipStatus: { $in: [...PENDING_STATUSES] },
    status: account_status.ACTIVE,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return students.map((s: any) => ({
    ...studentRow(s),
    requestedAt: s.createdAt,
  }));
};

const getApprovedMembershipsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const sinceDays = numParam(params, "sinceDays", 7);
  const limit = limitParam(params, 50);
  const students = await Student.find({
    membershipStatus: { $in: [...ACTIVE_STATUSES] },
    status: account_status.ACTIVE,
    createdAt: { $gte: daysAgo(sinceDays) },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return students.map((s: any) => ({
    ...studentRow(s),
    membershipStatus: s.membershipStatus,
    approvedAt: s.createdAt,
  }));
};

const getNewStudentsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const sinceDays = numParam(params, "sinceDays", 7);
  const limit = limitParam(params, 50);
  const students = await Student.find({
    createdAt: { $gte: daysAgo(sinceDays) },
    status: account_status.ACTIVE,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return students.map(studentRow);
};

const getMembershipRevenueFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 12);
  const revenue = await getMembershipRevenue();
  return revenue.slice(0, limit);
};

const getStudentDemographicsFn = async (): Promise<unknown> => {
  const groupBy = async (field: string) => {
    const rows = await Student.aggregate([
      { $match: { status: account_status.ACTIVE } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    // Raw values are reported as-is: campus_type and the event schemas disagree
    // on their campus codes, so mapping here would silently drop records.
    return rows.map((r: any) => ({
      value: r._id ?? "Unspecified",
      count: r.count,
    }));
  };

  const [byCampus, byCourse, byYear, total] = await Promise.all([
    groupBy("campus"),
    groupBy("course"),
    groupBy("year"),
    Student.countDocuments({ status: account_status.ACTIVE }),
  ]);

  return { total, byCampus, byCourse, byYear };
};

const getSuspendedAccountsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  const [students, admins] = await Promise.all([
    Student.find({ status: account_status.SUSPENDED })
      .select(
        "first_name last_name id_number course year campus deletedBy deletedDate"
      )
      .limit(limit)
      .lean(),
    Admin.find({ status: account_status.SUSPENDED })
      .select("name id_number position campus")
      .limit(limit)
      .lean(),
  ]);

  return {
    studentCount: students.length,
    adminCount: admins.length,
    students: students.map((s: any) => ({
      ...studentRow(s),
      suspendedBy: s.deletedBy,
      suspendedAt: s.deletedDate,
    })),
    admins: admins.map((a: any) => ({
      name: a.name,
      id_number: a.id_number,
      position: a.position,
      campus: a.campus,
    })),
  };
};

const getUpcomingInterviewsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const withinDays = numParam(params, "withinDays", 7);
  const limit = limitParam(params, 50);
  const applications = await Application.find({
    "interview.scheduledAt": { $gte: new Date(), $lte: daysAhead(withinDays) },
    "interview.status": {
      $in: [interviewStatus.SCHEDULED, interviewStatus.RESCHEDULED],
    },
  })
    .populate("position", "title")
    .sort({ "interview.scheduledAt": 1 })
    .limit(limit)
    .lean();

  return applications.map((a: any) => ({
    applicant_name: a.applicantSnapshot?.name || "N/A",
    id_number: a.applicantSnapshot?.idNumber || "N/A",
    position: a.position?.title || "N/A",
    scheduledAt: a.interview?.scheduledAt,
    location: a.interview?.location,
    interviewStatus: a.interview?.status,
  }));
};

const getStaleApplicationsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const daysOld = numParam(params, "daysOld", 7);
  const limit = limitParam(params, 50);
  const applications = await Application.find({
    status: applicationStatus.SUBMITTED,
    createdAt: { $lt: daysAgo(daysOld) },
    $or: [
      { reviewer: { $exists: false } },
      { reviewer: null },
      { reviewer: "" },
    ],
  })
    .populate("position", "title")
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  return applications.map((a: any) => ({
    applicant_name: a.applicantSnapshot?.name || "N/A",
    position: a.position?.title || "N/A",
    submittedAt: a.createdAt,
    daysWaiting: daysSince(a.createdAt),
  }));
};

const getHiringPipelineStatusFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  const positions = await RecruitmentPosition.find({
    hiringStatus: hiringStatus.OPEN,
    isActive: true,
  })
    .sort({ applicationDeadline: 1 })
    .limit(limit)
    .lean();

  return positions.map((p: any) => ({
    title: p.title,
    slotsFilled: p.slotsFilled ?? 0,
    slots: p.slots ?? "Unlimited",
    applicationDeadline: p.applicationDeadline,
    daysUntilDeadline: daysUntil(p.applicationDeadline),
  }));
};

// ─── Events Functions ──────────────────────────────────────────────────

const attendedCount = (attendees: any[] = []): number =>
  attendees.filter(
    (a) =>
      a.attendance?.morning?.attended ||
      a.attendance?.afternoon?.attended ||
      a.attendance?.evening?.attended
  ).length;

const getEventAttendanceStatsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const upcomingDays = numParam(params, "upcomingDays", 30);
  const limit = limitParam(params, 20);
  const events = await Event.find({
    // Previously `$lte` only, which also matched every past event.
    eventDate: { $gte: new Date(), $lte: daysAhead(upcomingDays) },
  })
    .select("eventName eventDate attendees")
    .sort({ eventDate: 1 })
    .limit(limit)
    .lean();

  if (events.length === 0) return [];

  const hydrated = await hydrateEventsAttendance(events as any);
  return (hydrated as any[]).map((event: any) => {
    const totalAttendees = event.attendees?.length ?? 0;
    const attended = attendedCount(event.attendees);
    return {
      event_name: event.eventName,
      event_date: event.eventDate,
      total_expected: totalAttendees,
      total_attended: attended,
      attendance_rate: `${percent(attended, totalAttendees)}%`,
    };
  });
};

const getAttendanceGapsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const thresholdPercent = numParam(params, "thresholdPercent", 50);
  const limit = limitParam(params, 10);
  const events = await Event.find()
    .select("eventName eventDate attendees")
    .sort({ eventDate: -1 })
    .limit(limit)
    .lean();

  if (events.length === 0) return [];

  const hydrated = await hydrateEventsAttendance(events as any);
  const gaps: any[] = [];
  for (const event of hydrated as any[]) {
    const totalAttendees = event.attendees?.length ?? 0;
    if (totalAttendees === 0) continue;
    const rate = percent(attendedCount(event.attendees), totalAttendees);
    if (rate < thresholdPercent) {
      gaps.push({
        event_name: event.eventName,
        event_date: event.eventDate,
        attendance_rate: `${rate}%`,
        threshold: `${thresholdPercent}%`,
      });
    }
  }
  return gaps;
};

const getCertificateEligibilityFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  // Counted in the DB — these events carry large embedded attendee arrays.
  return Event.aggregate([
    { $match: { isGenerateCertificate: true } },
    { $sort: { eventDate: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        event_name: "$eventName",
        event_date: "$eventDate",
        eligible_count: {
          $size: { $ifNull: ["$eligibleStudentsForCertificate", []] },
        },
        has_template: { $toBool: { $ifNull: ["$certificateTemplate", false] } },
      },
    },
  ]);
};

const getUpcomingEventsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const withinDays = numParam(params, "withinDays", 30);
  const limit = limitParam(params, 20);
  const events = await Event.aggregate([
    {
      $match: { eventDate: { $gte: new Date(), $lte: daysAhead(withinDays) } },
    },
    { $sort: { eventDate: 1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        eventName: 1,
        eventDate: 1,
        eventVenue: 1,
        attendanceType: 1,
        totalRevenueAll: 1,
        limit: 1,
        registrations: { $size: { $ifNull: ["$attendees", []] } },
      },
    },
  ]);

  return events.map((event: any) => ({
    event_name: event.eventName,
    event_date: event.eventDate,
    venue: event.eventVenue,
    attendance_type: event.attendanceType,
    registrations: event.registrations,
    total_revenue: event.totalRevenueAll ?? 0,
    campus_limits: (event.limit ?? []).map(
      (l: any) => `${l.campus}: ${l.limit}`
    ),
    daysUntil: daysUntil(event.eventDate),
  }));
};

const getLatestEventStatisticsFn = async (): Promise<unknown> => {
  const [event] = await Event.find({ eventDate: { $lte: new Date() } })
    .select("eventName eventDate attendees sales_data")
    .sort({ eventDate: -1 })
    .limit(1)
    .lean();

  if (!event) return { message: "No past events found" };

  const [hydrated] = (await hydrateEventsAttendance([event] as any)) as any[];
  const stats = computeEventStatistics(
    (hydrated?.attendees ?? []) as any,
    (hydrated?.sales_data ?? []) as any,
    "all"
  );

  return {
    event_name: (event as any).eventName,
    event_date: (event as any).eventDate,
    summary: stats.summary,
    campusBreakdown: stats.campusBreakdown,
    sessionAttendance: stats.sessionAttendance,
  };
};

const getRaffleStatusFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 20);
  // Counted in the DB: loading full attendee arrays for 20 events took ~50s.
  const events = await Event.aggregate([
    { $match: { "attendees.0": { $exists: true } } },
    { $sort: { eventDate: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        event_name: "$eventName",
        event_date: "$eventDate",
        total_attendees: { $size: "$attendees" },
        raffle_winners: {
          $size: {
            $filter: {
              input: "$attendees",
              cond: { $eq: ["$$this.raffleIsWinner", true] },
            },
          },
        },
        removed_from_raffle: {
          $size: {
            $filter: {
              input: "$attendees",
              cond: { $eq: ["$$this.raffleIsRemoved", true] },
            },
          },
        },
      },
    },
  ]);

  return events.map((e: any) => ({
    ...e,
    eligible_remaining:
      e.total_attendees - e.raffle_winners - e.removed_from_raffle,
  }));
};

// ─── System Functions ──────────────────────────────────────────────────

const revenueBetween = async (from: Date, to: Date) => {
  const [membershipResult, orderResult] = await Promise.all([
    MembershipHistory.aggregate([
      { $match: { date: { $gte: from, $lt: to } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Orders.aggregate([
      {
        $match: {
          order_status: "Paid",
          transaction_date: { $gte: from, $lt: to },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
  ]);
  const membership = membershipResult[0] || { total: 0, count: 0 };
  const orders = orderResult[0] || { total: 0, count: 0 };
  return {
    membership: { total: membership.total, count: membership.count },
    merch: { total: orders.total, count: orders.count },
    total: membership.total + orders.total,
  };
};

const getRevenueSummaryFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const periodDays = numParam(params, "periodDays", 30);
  const summary = await revenueBetween(daysAgo(periodDays), new Date());
  return { ...summary, period: `${periodDays} days` };
};

const getRevenueTrendFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const periodDays = numParam(params, "periodDays", 30);
  const currentStart = daysAgo(periodDays);

  const [current, previous] = await Promise.all([
    revenueBetween(currentStart, new Date()),
    revenueBetween(daysAgo(periodDays * 2), currentStart),
  ]);

  const change = (a: number, b: number): string => {
    if (b === 0) return a === 0 ? "0%" : "+100%";
    const delta = Math.round(((a - b) / b) * 100);
    return `${delta >= 0 ? "+" : ""}${delta}%`;
  };

  return {
    period: `${periodDays} days`,
    current: current.total,
    previous: previous.total,
    change: change(current.total, previous.total),
    membershipChange: change(
      current.membership.total,
      previous.membership.total
    ),
    merchChange: change(current.merch.total, previous.merch.total),
  };
};

const getEmailQueueStatsFn = async (): Promise<unknown> => getEmailQueueStats();

const getFailedEmailsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  const entries = await getFailedEmailDetails(limit);
  return entries.map((e) => ({
    email: e.email,
    type: e.type,
    subtype: e.subtype,
    retryCount: e.retryCount,
    daysPending: e.daysPending,
    canResend: e.canResend,
  }));
};

const getSystemHealthFn = async (): Promise<unknown> => {
  const health = await getHealthStats();
  const counts = await getDatabaseCounts();
  return { ...health, ...counts };
};

const getPromoUsageFn = async (params?: AutomationParams): Promise<unknown> => {
  const periodDays = numParam(params, "periodDays", 30);
  const limit = limitParam(params, 50);

  // Previously this just listed promos. Redemptions live in PromoUsage.
  const usage = await PromoUsage.aggregate([
    { $match: { promo_used: { $gte: daysAgo(periodDays) } } },
    {
      $group: {
        _id: "$promo_id",
        redemptions: { $sum: 1 },
        uniqueStudents: { $addToSet: "$id_number" },
      },
    },
    { $sort: { redemptions: -1 } },
    { $limit: limit },
  ]);

  const promos = await Promo.find({
    _id: { $in: usage.map((u: any) => u._id) },
  })
    .select("promo_name type discount quantity status")
    .lean();
  const byId = new Map(promos.map((p: any) => [p._id.toString(), p]));

  return usage.map((u: any) => {
    const promo = byId.get(u._id?.toString());
    return {
      name: promo?.promo_name ?? "Unknown promo",
      type: promo?.type,
      discount: promo?.discount,
      remaining_quantity: promo?.quantity,
      status: promo?.status,
      redemptions: u.redemptions,
      unique_students: u.uniqueStudents.length,
      period: `${periodDays} days`,
    };
  });
};

const getActiveAdminsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const limit = limitParam(params, 50);
  const admins = await Admin.find({
    currentRefreshToken: { $exists: true, $ne: null },
    status: account_status.ACTIVE,
  })
    .limit(limit)
    .lean();
  return admins.map((a: any) => ({
    name: a.name,
    id_number: a.id_number,
    position: a.position,
    campus: a.campus,
    lastActive: a.updatedAt,
  }));
};

const getCronExecutionSummaryFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const hours = numParam(params, "hours", 24);
  const limit = limitParam(params, 50);
  const since = new Date(Date.now() - hours * 3600000);

  const logs = (await getCronExecutionLogs(undefined, limit)) as any[];
  const recent = logs.filter((l) => new Date(l.startedAt) >= since);
  const failed = recent.filter((l) => !l.success);

  return {
    window: `${hours} hours`,
    totalRuns: recent.length,
    failedRuns: failed.length,
    slowestMs: recent.reduce(
      (max, l) => Math.max(max, Number(l.durationMs ?? 0)),
      0
    ),
    failures: failed.map((l) => ({
      jobName: l.jobName,
      startedAt: l.startedAt,
      durationMs: l.durationMs,
      error: l.errorMessage,
    })),
  };
};

const getServerErrorsFn = async (params?: AutomationParams): Promise<unknown> =>
  getErrors(limitParam(params, 50));

const getAdminActivitySummaryFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const sinceDays = numParam(params, "sinceDays", 7);
  const limit = limitParam(params, 20);
  const since = daysAgo(sinceDays);

  const [byAction, byAdmin, total] = await Promise.all([
    Log.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]),
    Log.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: "$admin", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]),
    Log.countDocuments({ timestamp: { $gte: since } }),
  ]);

  return {
    period: `${sinceDays} days`,
    totalActions: total,
    topActions: byAction.map((r: any) => ({ action: r._id, count: r.count })),
    topAdmins: byAdmin.map((r: any) => ({ admin: r._id, count: r.count })),
  };
};

const getNoetixUsageSummaryFn = async (): Promise<unknown> =>
  getNoetixUsageStats();

const getContributionSummaryFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const sinceDays = numParam(params, "sinceDays", 7);
  const byType = await Contribution.aggregate([
    { $match: { date: { $gte: daysAgo(sinceDays) } } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        commits: { $sum: { $ifNull: ["$commitCount", 0] } },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return {
    period: `${sinceDays} days`,
    total: byType.reduce((sum: number, r: any) => sum + r.count, 0),
    byType: byType.map((r: any) => ({
      type: r._id,
      count: r.count,
      commits: r.commits,
    })),
  };
};

const getDatabaseGrowthFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const stats = await getCollectionStats();
  return stats.slice(0, limitParam(params, 25));
};

const getSystemSettingsSnapshotFn = async (): Promise<unknown> => {
  const settings = await getSystemSettings();
  if (!settings) return { message: "No settings document found" };
  return {
    membership_price: settings.membership_price,
    chatbotEnabled: settings.chatbotEnabled ?? false,
    noetixDisabledAdminCount: settings.noetixDisabledAdmins?.length ?? 0,
  };
};

// ─── Security Functions ────────────────────────────────────────────────

const getRateLimitViolationsFn = async (
  params?: AutomationParams
): Promise<unknown> =>
  getRateLimitViolations(limitParam(params, 50)).map((v) => ({
    ip: v.ip,
    path: v.path,
    timestamp: v.timestamp,
  }));

const getBruteForceAttemptsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const threshold = numParam(params, "threshold", 5);
  return getBruteForceLogs(threshold, limitParam(params, 20)).map((l) => ({
    ip: l.ip,
    count: l.count,
    lastAttempt: l.lastAttempt,
  }));
};

const getStaleAdminSessionsFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const daysIdle = numParam(params, "daysIdle", 30);
  const limit = limitParam(params, 50);
  const admins = await Admin.find({
    currentRefreshToken: { $exists: true, $ne: null },
    status: account_status.ACTIVE,
    updatedAt: { $lt: daysAgo(daysIdle) },
  })
    .sort({ updatedAt: 1 })
    .limit(limit)
    .lean();

  return admins.map((a: any) => ({
    name: a.name,
    id_number: a.id_number,
    position: a.position,
    lastActive: a.updatedAt,
    daysIdle: daysSince(a.updatedAt),
  }));
};

const PRIVILEGE_ACTIONS = [
  logs_action.CHANGE_ACCESS,
  logs_action.REMOVE_ROLE,
  logs_action.APPROVE_ROLE,
  logs_action.REQUEST_ROLE,
  logs_action.SUSPEND,
  logs_action.RESTORE,
  logs_action.CREATE_ADMIN,
  logs_action.APPROVE_ADMIN,
];

const getPermissionChangesFn = async (
  params?: AutomationParams
): Promise<unknown> => {
  const sinceDays = numParam(params, "sinceDays", 7);
  const limit = limitParam(params, 50);
  const entries = await Log.find({
    action: { $in: PRIVILEGE_ACTIONS },
    timestamp: { $gte: daysAgo(sinceDays) },
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  return entries.map((l: any) => ({
    action: l.action,
    admin: l.admin,
    target: l.target,
    timestamp: l.timestamp,
  }));
};

const getEnvConfigStatusFn = async (): Promise<unknown> => {
  const vars = getEnvStatus();
  const missingRequired = vars.filter((v) => v.required && !v.configured);
  return {
    missingRequiredCount: missingRequired.length,
    missingRequired: missingRequired.map((v) => v.key),
    optionalUnset: vars
      .filter((v) => !v.required && !v.configured)
      .map((v) => v.key),
  };
};

// ─── Registry ──────────────────────────────────────────────────────────

export const AUTOMATION_FUNCTIONS: Record<string, AutomationFunctionDef> = {
  // Inventory
  getStockAlerts: {
    fn: getStockAlertsFn,
    defaultParams: { threshold: 5 },
    description: "Active items at or below the stock threshold",
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
    defaultParams: { daysNoSales: 30, limit: 50 },
    description: "Active merchandise with no sales in the given window",
    category: "inventory",
  },
  getExpiringMerch: {
    fn: getExpiringMerchFn,
    defaultParams: { withinDays: 7, limit: 50 },
    description: "Active merchandise whose sale window closes soon",
    category: "inventory",
  },
  getTopSellingMerch: {
    fn: getTopSellingMerchFn,
    defaultParams: { limit: 10 },
    description: "Best-selling merchandise by total revenue",
    category: "inventory",
  },
  getStockValuation: {
    fn: getStockValuationFn,
    defaultParams: {},
    description: "Total units and retail value of active inventory",
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
    defaultParams: { daysOld: 7, limit: 50 },
    description: "Pending orders past expiry (cancellable)",
    category: "orders",
  },
  getRefundQueue: {
    fn: getRefundQueueFn,
    defaultParams: { limit: 50 },
    description: "Most recent processed refunds",
    category: "orders",
  },
  getOrdersSummary: {
    fn: getOrdersSummaryFn,
    defaultParams: { periodDays: 7 },
    description: "Order counts by status, revenue, and average order value",
    category: "orders",
  },
  getMerchandiseReportSummary: {
    fn: getMerchandiseReportSummaryFn,
    defaultParams: { limit: 10 },
    description: "Merchandise sales report totals and top rows",
    category: "orders",
  },
  // Members
  getPendingApplications: {
    fn: getPendingApplicationsFn,
    defaultParams: { limit: 50 },
    description: "Recruitment applications awaiting review",
    category: "members",
  },
  getPendingMemberships: {
    fn: getPendingMembershipsFn,
    defaultParams: { limit: 50 },
    description: "Students with a pending membership request",
    category: "members",
  },
  getApprovedMemberships: {
    fn: getApprovedMembershipsFn,
    defaultParams: { sinceDays: 7, limit: 50 },
    description: "Students whose membership became approved recently",
    category: "members",
  },
  getNewStudents: {
    fn: getNewStudentsFn,
    defaultParams: { sinceDays: 7, limit: 50 },
    description: "Students registered in the given window",
    category: "members",
  },
  getMembershipRevenue: {
    fn: getMembershipRevenueFn,
    defaultParams: { limit: 12 },
    description: "Membership revenue broken down by month",
    category: "members",
  },
  getStudentDemographics: {
    fn: getStudentDemographicsFn,
    defaultParams: {},
    description: "Active students grouped by campus, course, and year",
    category: "members",
  },
  getSuspendedAccounts: {
    fn: getSuspendedAccountsFn,
    defaultParams: { limit: 50 },
    description: "Suspended student and admin accounts",
    category: "members",
  },
  getUpcomingInterviews: {
    fn: getUpcomingInterviewsFn,
    defaultParams: { withinDays: 7, limit: 50 },
    description: "Recruitment interviews scheduled in the given window",
    category: "members",
  },
  getStaleApplications: {
    fn: getStaleApplicationsFn,
    defaultParams: { daysOld: 7, limit: 50 },
    description: "Submitted applications with no reviewer past the given age",
    category: "members",
  },
  getHiringPipelineStatus: {
    fn: getHiringPipelineStatusFn,
    defaultParams: { limit: 50 },
    description: "Open positions with slots filled and deadlines",
    category: "members",
  },
  // Events
  getEventAttendanceStats: {
    fn: getEventAttendanceStatsFn,
    defaultParams: { upcomingDays: 30, limit: 20 },
    description: "Attendance rates for upcoming events",
    category: "events",
  },
  getAttendanceGaps: {
    fn: getAttendanceGapsFn,
    defaultParams: { thresholdPercent: 50, limit: 10 },
    description: "Recent events with attendance below the threshold",
    category: "events",
  },
  getCertificateEligibility: {
    fn: getCertificateEligibilityFn,
    defaultParams: { limit: 50 },
    description: "Certificate-enabled events and their eligible student counts",
    category: "events",
  },
  getUpcomingEvents: {
    fn: getUpcomingEventsFn,
    defaultParams: { withinDays: 30, limit: 20 },
    description: "Upcoming events with registrations and campus limits",
    category: "events",
  },
  getLatestEventStatistics: {
    fn: getLatestEventStatisticsFn,
    defaultParams: {},
    description: "Full statistics for the most recent past event",
    category: "events",
  },
  getRaffleStatus: {
    fn: getRaffleStatusFn,
    defaultParams: { limit: 20 },
    description: "Raffle winners and remaining eligible attendees per event",
    category: "events",
  },
  // System
  getRevenueSummary: {
    fn: getRevenueSummaryFn,
    defaultParams: { periodDays: 30 },
    description: "Membership + merch revenue summary",
    category: "system",
  },
  getRevenueTrend: {
    fn: getRevenueTrendFn,
    defaultParams: { periodDays: 30 },
    description: "Revenue this period vs the previous period, with % change",
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
    defaultParams: { periodDays: 30, limit: 50 },
    description: "Promo code redemptions in the given window",
    category: "system",
  },
  getActiveAdmins: {
    fn: getActiveAdminsFn,
    defaultParams: { limit: 50 },
    description: "Admins with active sessions",
    category: "system",
  },
  getCronExecutionSummary: {
    fn: getCronExecutionSummaryFn,
    defaultParams: { hours: 24, limit: 50 },
    description: "Scheduled job runs and failures in the given window",
    category: "system",
  },
  getServerErrors: {
    fn: getServerErrorsFn,
    defaultParams: { limit: 50 },
    description: "Recent unhandled server errors",
    category: "system",
  },
  getAdminActivitySummary: {
    fn: getAdminActivitySummaryFn,
    defaultParams: { sinceDays: 7, limit: 20 },
    description: "Audit log activity grouped by action and admin",
    category: "system",
  },
  getNoetixUsageSummary: {
    fn: getNoetixUsageSummaryFn,
    defaultParams: {},
    description: "Noetix AI usage, success rate, and most-used tools",
    category: "system",
  },
  getContributionSummary: {
    fn: getContributionSummaryFn,
    defaultParams: { sinceDays: 7 },
    description: "Developer/media/volunteer contributions in the given window",
    category: "system",
  },
  getDatabaseGrowth: {
    fn: getDatabaseGrowthFn,
    defaultParams: { limit: 25 },
    description: "Per-collection document counts and storage size",
    category: "system",
  },
  getSystemSettingsSnapshot: {
    fn: getSystemSettingsSnapshotFn,
    defaultParams: {},
    description: "Current membership price and feature toggles",
    category: "system",
  },
  // Security
  getRateLimitViolations: {
    fn: getRateLimitViolationsFn,
    defaultParams: { limit: 50 },
    description: "Most recent rate limit violations",
    category: "security",
  },
  getBruteForceAttempts: {
    fn: getBruteForceAttemptsFn,
    defaultParams: { threshold: 5, limit: 20 },
    description: "IPs with repeated failed login attempts",
    category: "security",
  },
  getStaleAdminSessions: {
    fn: getStaleAdminSessionsFn,
    defaultParams: { daysIdle: 30, limit: 50 },
    description: "Admin sessions still valid but idle past the given age",
    category: "security",
  },
  getPermissionChanges: {
    fn: getPermissionChangesFn,
    defaultParams: { sinceDays: 7, limit: 50 },
    description: "Role, access, and account status changes from the audit log",
    category: "security",
  },
  getEnvConfigStatus: {
    fn: getEnvConfigStatusFn,
    defaultParams: {},
    description: "Missing required environment configuration",
    category: "security",
  },
};
