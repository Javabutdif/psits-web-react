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
import mongoose from "mongoose";

export const getEmailQueueEntries = async ({
  status,
  subtype,
}: {
  status?: string;
  subtype?: string;
} = {}) => {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (subtype) query.subtype = subtype;

  return await EmailQueue.find(query).sort({ timestamp: -1 }).limit(100);
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
