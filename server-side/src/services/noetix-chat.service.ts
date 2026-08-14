import { Student } from "../models/student.model";
import { Merch } from "../models/merch.model";
import { Orders } from "../models/orders.model";
import { Event } from "../models/event.model";
import { Application } from "../models/application.model";
import { Log } from "../models/log.model";
import { MembershipHistory } from "../models/history.model";
import { Refund } from "../models/refund.model";
import { Contribution } from "../models/contribution.model";
import { EmailQueue } from "../models/email.model";
import { Attendance } from "../models/attendance.model";
import { RecruitmentPosition } from "../models/recruitmentPosition.model";
import { account_status, membership_status } from "../enums/status.enums";
import { applicationStatus } from "../enums/recruitment.enums";
import { contribution_types } from "../enums/contribution.enums";
import { adminService } from "./admin.service";
import { startOfDay, endOfDay } from "date-fns";

interface NoetixResponse {
  success: boolean;
  data: {
    sessionId: string;
    persona: string;
    result: string;
    matchedKeys: string[];
    sessionTTL: number;
  };
}

// Single-entry in-memory snapshot cache. Rebuilt on first call after TTL
// expiry; never stores failed fetches so a DB outage cannot poison it.
const SNAPSHOT_TTL_MS = 60_000;

interface SnapshotCacheEntry {
  data: Record<string, unknown>;
  fetchedAt: number;
}

let snapshotCache: SnapshotCacheEntry | null = null;

// Per-metric cache: each key fetched independently with its own TTL.
// Prevents a slow aggregate from blocking other metrics on every call.
const METRIC_TTL_MS = 60_000;

interface MetricCacheEntry {
  data: unknown;
  fetchedAt: number;
}

const metricCache = new Map<string, MetricCacheEntry>();

const getCachedOrFetch = async <T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> => {
  const now = Date.now();
  const entry = metricCache.get(key);
  if (entry && now - entry.fetchedAt < ttlMs) {
    return entry.data as T;
  }
  const data = await fn();
  metricCache.set(key, { data, fetchedAt: now });
  return data;
};

// Safe wrapper: runs a query and returns defaultValue on any failure.
// Prevents a single DB error from collapsing the entire snapshot.
const safeCount = async (
  fn: () => Promise<number>,
  defaultValue = 0
): Promise<number> => {
  try {
    return await fn();
  } catch {
    return defaultValue;
  }
};

const safeDailySales = async (): Promise<Array<{ totalSubtotal: number }>> => {
  try {
    const result = await Orders.aggregate([
      {
        $match: {
          transaction_date: {
            $gte: startOfDay(new Date()),
            $lte: endOfDay(new Date()),
          },
          order_status: "Paid",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          totalQuantity: { $sum: "$items.quantity" },
          totalSubtotal: { $sum: "$items.sub_total" },
        },
      },
      {
        $project: {
          product_name: "$_id",
          totalQuantity: 1,
          totalSubtotal: 1,
          _id: 0,
        },
      },
    ]);
    return result ?? [];
  } catch {
    return [];
  }
};

const safeTopSellingProducts = async (): Promise<
  Array<{ product_name: string; totalQuantity: number }>
> => {
  try {
    const result = await Orders.aggregate([
      { $match: { order_status: "Paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $project: {
          product_name: "$_id",
          totalQuantity: 1,
          _id: 0,
        },
      },
    ]);
    return result ?? [];
  } catch {
    return [];
  }
};

const safeTotalRevenue = async (): Promise<number> => {
  try {
    const result = await Orders.aggregate([
      { $match: { order_status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeStudentsByCampus = async (): Promise<Record<string, number>> => {
  try {
    const result = await Student.aggregate([
      { $match: { status: account_status.ACTIVE } },
      { $group: { _id: "$campus", count: { $sum: 1 } } },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.count;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const safeMerchTotalStock = async (): Promise<number> => {
  try {
    const result = await Merch.aggregate([
      {
        $match: {
          is_active: true,
          start_date: { $lte: new Date() },
          end_date: { $gte: new Date() },
        },
      },
      { $group: { _id: null, total: { $sum: "$stocks" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeEventAttendees = async (): Promise<number> => {
  try {
    const result = await Event.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$attendees" } } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeApplicationsByStatus = async (): Promise<Record<string, number>> => {
  try {
    const result = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.count;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

// Students
const safeStudentsActiveWithMembership = async (): Promise<number> => {
  try {
    return await Student.countDocuments({
      status: account_status.ACTIVE,
      membershipStatus: { $in: [membership_status.ACTIVE, membership_status.RENEWED] },
    });
  } catch {
    return 0;
  }
};

const safeStudentsNewThisWeek = async (): Promise<number> => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await Student.countDocuments({
      createdAt: { $gte: weekAgo },
      status: account_status.ACTIVE,
    });
  } catch {
    return 0;
  }
};

const safeStudentsPendingAccount = async (): Promise<number> => {
  try {
    return await Student.countDocuments({ status: account_status.PENDING });
  } catch {
    return 0;
  }
};

// Orders & payments
const safeOrdersTotalRevenueToday = async (): Promise<number> => {
  try {
    const result = await Orders.aggregate([
      {
        $match: {
          order_status: "Paid",
          transaction_date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeOrdersAvgValuePaid = async (): Promise<number> => {
  try {
    const result = await Orders.aggregate([
      { $match: { order_status: "Paid" } },
      { $group: { _id: null, avg: { $avg: "$total" } } },
    ]);
    return result?.[0]?.avg ?? 0;
  } catch {
    return 0;
  }
};

const safeOrdersByStatusCount = async (): Promise<Record<string, number>> => {
  try {
    const result = await Orders.aggregate([
      { $group: { _id: "$order_status", count: { $sum: 1 } } },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.count;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const safeOrdersRefundedCount = async (): Promise<number> => {
  try {
    return await Refund.countDocuments();
  } catch {
    return 0;
  }
};

const safeOrdersRefundedTotal = async (): Promise<number> => {
  try {
    const result = await Refund.aggregate([
      { $group: { _id: null, total: { $sum: "$refund_price" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeOrdersTodayByCampus = async (): Promise<Record<string, number>> => {
  try {
    const result = await Orders.aggregate([
      {
        $match: {
          order_status: "Paid",
          transaction_date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        },
      },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.count;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

// Merch & products
const safeMerchProductsByCategory = async (): Promise<Record<string, number>> => {
  try {
    const result = await Merch.countDocuments({ is_active: true });
    // Return total count as a simple scalar wrapped — key is metric name, value is number
    // For grouped-by-category we use a separate approach
    const aggResult = await Merch.aggregate([
      {
        $match: {
          is_active: true,
          start_date: { $lte: new Date() },
          end_date: { $gte: new Date() },
        },
      },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    return (aggResult ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.count;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const safeMerchUnitsSoldToday = async (): Promise<number> => {
  try {
    const result = await Orders.aggregate([
      {
        $match: {
          order_status: "Paid",
          transaction_date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        },
      },
      { $unwind: "$items" },
      { $group: { _id: null, total: { $sum: "$items.quantity" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeMerchLowStockThreshold5 = async (): Promise<number> => {
  try {
    return await Merch.countDocuments({
      is_active: true,
      start_date: { $lte: new Date() },
      end_date: { $gte: new Date() },
      stocks: { $lte: 5, $gt: 0 },
    });
  } catch {
    return 0;
  }
};

const safeMerchOutOfStock = async (): Promise<number> => {
  try {
    return await Merch.countDocuments({
      is_active: true,
      stocks: 0,
    });
  } catch {
    return 0;
  }
};

const safeMerchTop5ByRevenue = async (): Promise<Array<{ product_name: string; totalRevenue: number }>> => {
  try {
    const result = await Orders.aggregate([
      { $match: { order_status: "Paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          totalRevenue: { $sum: "$items.sub_total" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $project: { product_name: "$_id", totalRevenue: 1, _id: 0 },
      },
    ]);
    return result ?? [];
  } catch {
    return [];
  }
};

// Events
const safeEventsTotalRevenue = async (): Promise<number> => {
  try {
    const result = await Event.aggregate([
      { $group: { _id: null, total: { $sum: "$totalRevenueAll" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeEventsTotalUnitsSold = async (): Promise<number> => {
  try {
    const result = await Event.aggregate([
      { $group: { _id: null, total: { $sum: "$totalUnitsSold" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeEventsByCampusSales = async (): Promise<Record<string, number>> => {
  try {
    const result = await Event.aggregate([
      { $unwind: "$sales_data" },
      {
        $group: {
          _id: "$sales_data.campus",
          totalRevenue: { $sum: "$sales_data.totalRevenue" },
        },
      },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.totalRevenue;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const safeEventsUpcomingTicketsSold = async (): Promise<number> => {
  try {
    const result = await Event.aggregate([
      { $match: { eventDate: { $gte: new Date() } } },
      { $group: { _id: null, total: { $sum: { $size: "$attendees" } } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

// Recruitment
const safeRecruitmentOpenPositions = async (): Promise<number> => {
  try {
    return await RecruitmentPosition.countDocuments({
      hiringStatus: "OPEN",
      isActive: true,
    });
  } catch {
    return 0;
  }
};

const safeRecruitmentApprovedApplications = async (): Promise<number> => {
  try {
    return await Application.countDocuments({ status: applicationStatus.APPROVED });
  } catch {
    return 0;
  }
};

const safeRecruitmentInterviewScheduled = async (): Promise<number> => {
  try {
    return await Application.countDocuments({ status: applicationStatus.INTERVIEW_SCHEDULED });
  } catch {
    return 0;
  }
};

const safeRecruitmentPipelineByPosition = async (): Promise<Record<string, number>> => {
  try {
    const result = await Application.aggregate([
      { $group: { _id: "$position", count: { $sum: 1 } } },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.count;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

// Contributions
const safeContributionsTotalRecords = async (): Promise<number> => {
  try {
    return await Contribution.countDocuments();
  } catch {
    return 0;
  }
};

const safeContributionsByType = async (): Promise<Record<string, number>> => {
  try {
    const result = await Contribution.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id) acc[String(row._id)] = row.count;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

// Email queue
const safeEmailQueuePending = async (): Promise<number> => {
  try {
    return await EmailQueue.countDocuments({ status: "pending" });
  } catch {
    return 0;
  }
};

const safeEmailQueueSent = async (): Promise<number> => {
  try {
    return await EmailQueue.countDocuments({ status: "sent" });
  } catch {
    return 0;
  }
};

const safeEmailQueueFailed = async (): Promise<number> => {
  try {
    return await EmailQueue.countDocuments({ status: "failed" });
  } catch {
    return 0;
  }
};

// Hybrid / cross-entity
const safeRevenueByYearGrouped = async (): Promise<Record<string, number>> => {
  try {
    const result = await Orders.aggregate([
      { $match: { order_status: "Paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$year",
          totalRevenue: { $sum: "$items.sub_total" },
        },
      },
    ]);
    return (result ?? []).reduce<Record<string, number>>((acc, row) => {
      if (row._id !== null && row._id !== undefined) {
        acc[String(row._id)] = row.totalRevenue;
      }
      return acc;
    }, {} as Record<string, number>);
  } catch {
    return {};
  }
};

const safeMembershipRevenueToday = async (): Promise<number> => {
  try {
    const result = await MembershipHistory.aggregate([
      {
        $match: {
          date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    return result?.[0]?.total ?? 0;
  } catch {
    return 0;
  }
};

const safeTop5StudentsBySpend = async (): Promise<
  Array<{ id_number: string; totalSpent: number }>
> => {
  try {
    const result = await Orders.aggregate([
      { $match: { order_status: "Paid" } },
      {
        $group: {
          _id: "$id_number",
          totalSpent: { $sum: "$total" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $project: { id_number: "$_id", totalSpent: 1, _id: 0 },
      },
    ]);
    return result ?? [];
  } catch {
    return [];
  }
};

const safeDashboardCount = async (): Promise<{
  years: Record<string, number>;
  courses: Record<string, number>;
}> => {
  try {
    return await adminService.getAdminDashboardCount();
  } catch {
    return {
      years: { year1: 0, year2: 0, year3: 0, year4: 0 },
      courses: { BSIT: 0, BSCS: 0, ACT: 0 },
    };
  }
};

// Inner cache — each metric fetched independently with its own TTL.
// Faster fan-out for the new 30 metrics without blocking the original 30.
const fetchAllCached = async (): Promise<Record<string, unknown>> => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const t = METRIC_TTL_MS;

  const [
    dashboardCount,
    studentTotal,
    studentActive,
    studentPendingMembership,
    studentDeleted,
    merchActiveCount,
    orderPending,
    orderPaid,
    orderRefunded,
    dailySales,
    activeMemberships,
    eventCount,
    pendingApplications,
    recentLogs,
    studentSuspended,
    studentNewToday,
    studentsWithMembership,
    studentsByCampus,
    orderTotal,
    orderTotalRevenue,
    orderTodayCount,
    topSellingProducts,
    merchTotalProducts,
    merchTotalStock,
    merchLowStock,
    upcomingEvents,
    totalAttendees,
    applicationsTotal,
    applicationsByStatus,
    studentsActiveWithMembership,
    studentsNewThisWeek,
    studentsPendingAccount,
    ordersTotalRevenueToday,
    ordersAvgValuePaid,
    ordersByStatusCount,
    ordersRefundedCount,
    ordersRefundedTotal,
    ordersTodayByCampus,
    merchProductsByCategory,
    merchUnitsSoldToday,
    merchLowStockThreshold5,
    merchOutOfStock,
    merchTop5ByRevenue,
    eventsTotalRevenue,
    eventsTotalUnitsSold,
    eventsByCampusSales,
    eventsUpcomingTicketsSold,
    recruitmentOpenPositions,
    recruitmentApprovedApplications,
    recruitmentInterviewScheduled,
    recruitmentPipelineByPosition,
    contributionsTotalRecords,
    contributionsByType,
    emailQueuePending,
    emailQueueSent,
    emailQueueFailed,
    revenueByYearGrouped,
    membershipRevenueToday,
    top5StudentsBySpend,
  ] = await Promise.all([
    getCachedOrFetch("dashboardCount", t, safeDashboardCount),
    getCachedOrFetch("students_total", t, () => safeCount(() => Student.countDocuments())),
    getCachedOrFetch("students_active", t, () => safeCount(() => Student.countDocuments({ status: account_status.ACTIVE }))),
    getCachedOrFetch("students_pending_membership", t, () =>
      safeCount(() => Student.countDocuments({ membershipStatus: membership_status.PENDING }))
    ),
    getCachedOrFetch("students_deleted", t, () =>
      safeCount(() => Student.countDocuments({ status: account_status.DELETED }), 0)
    ),
    getCachedOrFetch("merch_active_products", t, () =>
      safeCount(() => Merch.countDocuments({
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now },
      }))
    ),
    getCachedOrFetch("orders_pending", t, () => Orders.countDocuments({ order_status: "Pending" })),
    getCachedOrFetch("orders_paid", t, () => Orders.countDocuments({ order_status: "Paid" })),
    getCachedOrFetch("orders_refunded", t, () => Orders.countDocuments({ order_status: "Refunded" })),
    getCachedOrFetch("daily_sales", t, safeDailySales),
    getCachedOrFetch("memberships_active", t, () =>
      safeCount(() =>
        Student.countDocuments({
          status: account_status.ACTIVE,
          membershipStatus: { $in: [membership_status.ACTIVE, membership_status.RENEWED] },
        })
      )
    ),
    getCachedOrFetch("events_total", t, () => Event.countDocuments()),
    getCachedOrFetch("recruitment_pending_applications", t, () =>
      safeCount(() => Application.countDocuments({ status: applicationStatus.SUBMITTED }))
    ),
    getCachedOrFetch("recent_logs_today", t, () =>
      safeCount(() => Log.countDocuments({ timestamp: { $gte: todayStart, $lte: todayEnd } }))
    ),
    getCachedOrFetch("students_suspended", t, () =>
      safeCount(() => Student.countDocuments({ status: account_status.SUSPENDED }))
    ),
    getCachedOrFetch("students_new_today", t, () =>
      safeCount(() => Student.countDocuments({ createdAt: { $gte: todayStart } }))
    ),
    getCachedOrFetch("students_with_membership", t, () =>
      safeCount(() =>
        Student.countDocuments({
          membershipStatus: {
            $in: [membership_status.ACTIVE, membership_status.RENEWED, membership_status.PENDING],
          },
        })
      )
    ),
    getCachedOrFetch("students_by_campus", t, safeStudentsByCampus),
    getCachedOrFetch("orders_total", t, () => Orders.countDocuments()),
    getCachedOrFetch("orders_total_revenue", t, safeTotalRevenue),
    getCachedOrFetch("orders_today_count", t, () =>
      safeCount(() =>
        Orders.countDocuments({
          transaction_date: { $gte: todayStart, $lte: todayEnd },
          order_status: "Paid",
        })
      )
    ),
    getCachedOrFetch("top_selling_products", t, safeTopSellingProducts),
    getCachedOrFetch("merch_total_products", t, () => Merch.countDocuments()),
    getCachedOrFetch("merch_total_stock", t, safeMerchTotalStock),
    getCachedOrFetch("merch_low_stock", t, () =>
      safeCount(() =>
        Merch.countDocuments({
          is_active: true,
          start_date: { $lte: now },
          end_date: { $gte: now },
          stocks: { $lte: 10 },
        })
      )
    ),
    getCachedOrFetch("events_upcoming", t, () => Event.countDocuments({ eventDate: { $gte: now } })),
    getCachedOrFetch("total_attendees", t, safeEventAttendees),
    getCachedOrFetch("applications_total", t, () => Application.countDocuments()),
    getCachedOrFetch("applications_by_status", t, safeApplicationsByStatus),
    getCachedOrFetch("students_active_with_membership", t, safeStudentsActiveWithMembership),
    getCachedOrFetch("students_new_this_week", t, safeStudentsNewThisWeek),
    getCachedOrFetch("students_pending_account", t, safeStudentsPendingAccount),
    getCachedOrFetch("orders_total_revenue_today", t, safeOrdersTotalRevenueToday),
    getCachedOrFetch("orders_avg_value_paid", t, safeOrdersAvgValuePaid),
    getCachedOrFetch("orders_by_status_count", t, safeOrdersByStatusCount),
    getCachedOrFetch("orders_refunded_count", t, safeOrdersRefundedCount),
    getCachedOrFetch("orders_refunded_total", t, safeOrdersRefundedTotal),
    getCachedOrFetch("orders_today_by_campus", t, safeOrdersTodayByCampus),
    getCachedOrFetch("merch_products_by_category", t, safeMerchProductsByCategory),
    getCachedOrFetch("merch_units_sold_today", t, safeMerchUnitsSoldToday),
    getCachedOrFetch("merch_low_stock_5", t, safeMerchLowStockThreshold5),
    getCachedOrFetch("merch_out_of_stock", t, safeMerchOutOfStock),
    getCachedOrFetch("merch_top5_by_revenue", t, safeMerchTop5ByRevenue),
    getCachedOrFetch("events_total_revenue", t, safeEventsTotalRevenue),
    getCachedOrFetch("events_total_units_sold", t, safeEventsTotalUnitsSold),
    getCachedOrFetch("events_by_campus_sales", t, safeEventsByCampusSales),
    getCachedOrFetch("events_upcoming_tickets_sold", t, safeEventsUpcomingTicketsSold),
    getCachedOrFetch("recruitment_open_positions", t, safeRecruitmentOpenPositions),
    getCachedOrFetch("recruitment_approved_applications", t, safeRecruitmentApprovedApplications),
    getCachedOrFetch("recruitment_interview_scheduled", t, safeRecruitmentInterviewScheduled),
    getCachedOrFetch("recruitment_pipeline_by_position", t, safeRecruitmentPipelineByPosition),
    getCachedOrFetch("contributions_total_records", t, safeContributionsTotalRecords),
    getCachedOrFetch("contributions_by_type", t, safeContributionsByType),
    getCachedOrFetch("email_queue_pending", t, safeEmailQueuePending),
    getCachedOrFetch("email_queue_sent", t, safeEmailQueueSent),
    getCachedOrFetch("email_queue_failed", t, safeEmailQueueFailed),
    getCachedOrFetch("revenue_by_year_grouped", t, safeRevenueByYearGrouped),
    getCachedOrFetch("membership_revenue_today", t, safeMembershipRevenueToday),
    getCachedOrFetch("top5_students_by_spend", t, safeTop5StudentsBySpend),
  ]);

  const snapshotRevenue = dailySales.reduce(
    (sum, sale) => sum + (sale.totalSubtotal ?? 0),
    0
  );

  return {
    // ---- Original 15 ----
    students_total: studentTotal,
    students_active: studentActive,
    students_pending_membership: studentPendingMembership,
    students_deleted: studentDeleted,
    students_by_year: dashboardCount.years,
    students_by_course: dashboardCount.courses,
    orders_pending: orderPending,
    orders_paid: orderPaid,
    orders_refunded: orderRefunded,
    orders_today_revenue: snapshotRevenue,
    merch_active_products: merchActiveCount,
    memberships_active: activeMemberships,
    events_total: eventCount,
    recruitment_pending_applications: pendingApplications,
    activity_recent_logs_today: recentLogs,
    // ---- Second batch (previously added) ----
    students_suspended: studentSuspended,
    students_new_today: studentNewToday,
    students_with_membership: studentsWithMembership,
    students_by_campus: studentsByCampus,
    orders_total: orderTotal,
    orders_total_revenue: orderTotalRevenue,
    orders_today_count: orderTodayCount,
    top_selling_products: topSellingProducts,
    merch_total_products: merchTotalProducts,
    merch_total_stock: merchTotalStock,
    merch_low_stock_products: merchLowStock,
    events_upcoming: upcomingEvents,
    events_total_attendees: totalAttendees,
    recruitment_applications_total: applicationsTotal,
    recruitment_applications_by_status: applicationsByStatus,
    // ---- New 30 metrics ----
    students_active_with_membership: studentsActiveWithMembership,
    students_new_this_week: studentsNewThisWeek,
    students_pending_account: studentsPendingAccount,
    orders_total_revenue_today: ordersTotalRevenueToday,
    orders_avg_value_paid: ordersAvgValuePaid,
    orders_by_status_count: ordersByStatusCount,
    orders_refunded_count: ordersRefundedCount,
    orders_refunded_total: ordersRefundedTotal,
    orders_today_by_campus: ordersTodayByCampus,
    merch_products_by_category: merchProductsByCategory,
    merch_units_sold_today: merchUnitsSoldToday,
    merch_low_stock_threshold_5: merchLowStockThreshold5,
    merch_out_of_stock: merchOutOfStock,
    merch_top5_by_revenue: merchTop5ByRevenue,
    events_total_revenue: eventsTotalRevenue,
    events_total_units_sold: eventsTotalUnitsSold,
    events_by_campus_sales: eventsByCampusSales,
    events_upcoming_tickets_sold: eventsUpcomingTicketsSold,
    recruitment_open_positions: recruitmentOpenPositions,
    recruitment_approved_applications: recruitmentApprovedApplications,
    recruitment_interview_scheduled: recruitmentInterviewScheduled,
    recruitment_pipeline_by_position: recruitmentPipelineByPosition,
    contributions_total_records: contributionsTotalRecords,
    contributions_by_type: contributionsByType,
    email_queue_pending: emailQueuePending,
    email_queue_sent: emailQueueSent,
    email_queue_failed: emailQueueFailed,
    revenue_by_year_grouped: revenueByYearGrouped,
    membership_revenue_today: membershipRevenueToday,
    top5_students_by_spend: top5StudentsBySpend,
  };
};

export const fetchFullSnapshot = async (): Promise<Record<string, unknown>> => {
  const now = Date.now();
  if (snapshotCache && now - snapshotCache.fetchedAt < SNAPSHOT_TTL_MS) {
    return snapshotCache.data;
  }

  const snapshot = await fetchAllCached();

  snapshotCache = { data: snapshot, fetchedAt: now };
  return snapshot;
};

export const generateEmailBody = async (
  goal: string,
  data: Record<string, unknown>
): Promise<string> => {
  const result = await queryNoetix("EMAIL_SENDER", goal, data);
  return result.data.result;
};

export const queryNoetix = async (
  persona: string,
  goal: string,
  data: Record<string, unknown>,
  sessionId?: string,
  destroy?: boolean
): Promise<NoetixResponse> => {
  const noetixUrl = process.env.NOETIX_URL || "http://localhost:3000";
  const apiKey = process.env.NOETIX_API_KEY;

  if (!apiKey) {
    throw new Error("NOETIX_API_KEY is not configured");
  }

  const body: Record<string, unknown> = { persona, goal, data };
  console.log("Querying Noetix with body:", goal, data, sessionId, destroy);

  if (sessionId) body.sessionId = sessionId;
  if (destroy) body.destroy = true;

  const response = await fetch(`${noetixUrl}/api/agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const code = errorBody?.error?.code;
    if (code) {
      const err = new Error(code) as Error & { status: number };
      err.status = response.status;
      throw err;
    }
    throw new Error(`Noetix API error: ${response.status}`);
  }

  return response.json() as Promise<NoetixResponse>;
};
