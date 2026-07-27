import { EmailQueue } from "../models/email.model";
import { Orders } from "../models/orders.model";
import { MembershipHistory } from "../models/history.model";
import { Admin } from "../models/admin.model";
import { Student } from "../models/student.model";
import { Merch } from "../models/merch.model";
import { Event } from "../models/event.model";
import ejs from "ejs";
import path from "path";
import fs from "fs/promises";
import os from "os";
import mongoose, { Types } from "mongoose";

export const getEmailQueueEntries = async ({
  status,
  subtype,
  limit = 100,
  skip = 0,
}: {
  status?: string;
  subtype?: string;
  limit?: number;
  skip?: number;
} = {}) => {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (subtype) query.subtype = subtype;

  return await EmailQueue.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
};

export const getEmailQueueCount = async ({
  status,
  subtype,
}: {
  status?: string;
  subtype?: string;
} = {}) => {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (subtype) query.subtype = subtype;

  return await EmailQueue.countDocuments(query);
};

export const resendSingleEmail = async (id: string) => {
  const entry = await EmailQueue.findById(id);
  if (!entry) throw new Error("Email queue entry not found");

  if (entry.type !== "receipt") {
    throw new Error("Only receipt emails can be resent");
  }

  if (!entry.subtype) {
    throw new Error("Entry has no subtype");
  }

  let html: string;
  let subject: string;

  if (entry.subtype === "membership") {
    const history = await MembershipHistory.findOne({
      reference_code: entry.referenceCode,
    });
    if (!history) throw new Error(`Membership history not found for ${entry.referenceCode}`);

    const templatePath = path.join(__dirname, "../../assets/appr-membership-receipt.ejs");
    const cash = history.total;
    html = await ejs.renderFile(templatePath, {
      name: history.name,
      reference_code: history.reference_code,
      cash,
      total: history.total,
      course: history.course,
      year: history.year,
      admin: history.admin,
      date: new Date(history.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      change: 0,
    });
    subject = "Your Receipt from PSITS - UC Main";
  } else if (entry.subtype === "order") {
    const order = await Orders.findOne({
      reference_code: entry.referenceCode,
    });
    if (!order) throw new Error(`Order not found for ${entry.referenceCode}`);

    const templatePath = path.join(__dirname, "../../assets/appr-order-receipt.ejs");
    html = await ejs.renderFile(templatePath, {
      reference_code: order.reference_code,
      transaction_date: order.transaction_date
        ? new Date(order.transaction_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
      student_name: order.student_name,
      id_number: order.id_number,
      course: order.course,
      year: order.year,
      admin: order.admin || "N/A",
      items: order.items.map((item: any) => ({
        product_name: item.product_name,
        batch: item.batch,
        sizes: item.sizes || [],
        variation: item.variation || [],
        quantity: item.quantity,
        sub_total: item.sub_total,
      })),
      cash: order.total,
      total: order.total,
    });
    subject = "Your Order Receipt from PSITS - UC Main";
  } else {
    throw new Error(`Unknown subtype: ${entry.subtype}`);
  }

  const logoPath = path.join(__dirname, "../../assets/psits.jpg");
  const logoBuffer = await fs.readFile(logoPath);

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL;

  if (!from) throw new Error("EMAIL is not configured");

  const { error } = await resend.emails.send({
    from,
    to: String(entry.email),
    subject,
    html,
    attachments: [
      {
        filename: "psits.jpg",
        content: logoBuffer,
        contentType: "image/jpeg",
        contentId: "logo",
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};

export const getHealthStats = async () => {
  const uptimeSeconds = Math.floor(process.uptime());
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const uptime = `${days}d ${hours}h ${minutes}m`;

  const memUsed = process.memoryUsage().rss;
  const memTotal = os.totalmem();
  const memUsedMB = Math.round(memUsed / 1024 / 1024);
  const memTotalMB = Math.round(memTotal / 1024 / 1024);

  const emailConfigured = !!(process.env.EMAIL && process.env.RESEND_API_KEY);

  return {
    uptime,
    memory: { used: memUsedMB, total: memTotalMB },
    emailConfigured,
  };
};

export const getDatabaseCounts = async () => {
  const [students, orders, merch, events, membershipHistory] = await Promise.all([
    Student.countDocuments(),
    Orders.countDocuments({ order_status: "Pending" }),
    Merch.countDocuments({ is_active: true }),
    Event.countDocuments(),
    MembershipHistory.countDocuments(),
  ]);

  return { students, pendingOrders: orders, merchItems: merch, activeEvents: events, memberships: membershipHistory };
};

export const checkMongoConnection = async (): Promise<boolean> => {
  try {
    await mongoose.connection.db?.admin().ping();
    return true;
  } catch {
    return false;
  }
};

const cronExecutionLogCache: { data: any[]; timestamp: number } | null = null;

export const getCronExecutionLogs = async (jobName?: string, limit = 20) => {
  const { CronExecutionLog } = await import("../models/cronExecutionLog.model");
  const query: Record<string, unknown> = {};
  if (jobName) query.jobName = jobName;

  return await CronExecutionLog.find(query)
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean();
};

export const logCronExecution = async (data: {
  jobName: string;
  scheduledAt: Date;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) => {
  const { CronExecutionLog } = await import("../models/cronExecutionLog.model");
  await new CronExecutionLog({
    ...data,
    createdAt: new Date(),
  }).save();
};

export const getEnvStatus = () => {
  const vars: Array<{ key: string; required: boolean }> = [
    { key: "EMAIL", required: true },
    { key: "RESEND_API_KEY", required: true },
    { key: "BASE_URL", required: true },
    { key: "MONGO_URI", required: true },
    { key: "R2_BUCKET_NAME", required: false },
    { key: "R2_ACCOUNT_ID", required: false },
    { key: "AWS_BUCKET_NAME", required: false },
    { key: "AWS_REGION", required: false },
  ];

  return vars.map((v) => ({
    key: v.key,
    configured: Boolean(process.env[v.key]),
    required: v.required,
  }));
};

const rateLimitBlockedCounters: { count: number; day: string } = { count: 0, day: "" };

export const getRateLimitStats = () => {
  const today = new Date().toISOString().split("T")[0];
  if (rateLimitBlockedCounters.day !== today) {
    rateLimitBlockedCounters.count = 0;
    rateLimitBlockedCounters.day = today;
  }

  return {
    windowMs: 15 * 60 * 1000,
    maxRequests: process.env.NODE_ENV !== "production" ? 100 : 20,
    blockedToday: rateLimitBlockedCounters.count,
  };
};

export const incrementRateLimitBlocked = () => {
  const today = new Date().toISOString().split("T")[0];
  if (rateLimitBlockedCounters.day !== today) {
    rateLimitBlockedCounters.count = 0;
    rateLimitBlockedCounters.day = today;
  }
  rateLimitBlockedCounters.count++;
};

interface CollectionStat {
  name: string;
  docs: number;
  avgObjSize: number;
  storageSize: number;
  indexes: number;
  warning?: string;
}

let dbPerfCacheData: CollectionStat[] | null = null;
let dbPerfCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

const collectionIndexMap: Record<string, string[]> = {
  Orders: ["order_status", "order_date"],
  EmailQueue: ["status", "type"],
  Merch: ["is_active"],
  Admin: ["currentRefreshToken"],
  Student: ["currentRefreshToken"],
};

export const getCollectionStats = async (): Promise<CollectionStat[]> => {
  if (dbPerfCacheData && Date.now() - dbPerfCacheTime < CACHE_TTL_MS) {
    return dbPerfCacheData;
  }

  const db = mongoose.connection.db;
  if (!db) return [];

  const collections = await db.listCollections().toArray();
  const stats: CollectionStat[] = [];

  for (const coll of collections) {
    const name = coll.name;
    if (name.startsWith("system.")) continue;

    try {
      const model = mongoose.model(name);
      const docCount = await model.countDocuments();

      let info: any;
      try {
        info = await (db as any).collection(name).stats();
      } catch {
        info = { avgObjSize: 0, storageSize: 0 };
      }

      const expectedIndexes = collectionIndexMap[name] || [];
      let warning: string | undefined;

      if (expectedIndexes.length > 0) {
        try {
          const indexes = await (model.collection as any).indexes();
          const indexedFields = indexes.flatMap((idx: any) =>
            Object.keys(idx.key).filter((f: string) => expectedIndexes.includes(f))
          );
          const missing = expectedIndexes.filter((f: string) => !indexedFields.includes(f));
          if (missing.length > 0) {
            warning = `Missing indexes on: ${missing.join(", ")}`;
          }
        } catch {
          // Skip index check if unavailable
        }
      }

      stats.push({
        name,
        docs: docCount,
        avgObjSize: Math.round(info.avgObjSize || 0),
        storageSize: Math.round((info.storageSize || 0) / 1024),
        indexes: 0,
        warning,
      });
    } catch {
      // Skip collections that can't be accessed
    }
  }

  dbPerfCacheData = stats.map((s) => ({ ...s, indexes: s.indexes || 0 }));
  dbPerfCacheTime = Date.now();

  return dbPerfCacheData;
};

export const rebuildIndexes = async (): Promise<{
  message: string;
  collections: string[];
}> => {
  const collectionsToRebuild = ["Orders", "EmailQueue", "Merch", "Admin", "Student"];
  const rebuilt: string[] = [];

  for (const collName of collectionsToRebuild) {
    try {
      const model = mongoose.model(collName);
      await (model.collection as any).reIndex();
      rebuilt.push(collName);
    } catch {
      // Skip failed rebuilds
    }
  }

  dbPerfCacheTime = 0;
  dbPerfCacheData = null;

  return {
    message: `Rebuilt indexes on ${rebuilt.length} collection(s)`,
    collections: rebuilt,
  };
};
