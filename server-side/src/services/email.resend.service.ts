import ejs from "ejs";
import path from "path";
import fs from "fs/promises";
import { emailService } from "./email.service";
import { Orders } from "../models/orders.model";
import { MembershipHistory } from "../models/history.model";
import { orderService } from "./order.service";
import { format } from "date-fns";

const MAX_RETRIES = 3;

interface PendingEntry {
  _id: string;
  email: string;
  subtype: string;
  referenceCode: string;
  retryCount: number;
}

const toPendingEntry = (entry: any): PendingEntry => ({
  _id: entry._id.toString(),
  email: String(entry.email),
  subtype: entry.subtype || "",
  referenceCode: entry.referenceCode || "",
  retryCount: entry.retryCount || 0,
});

const renderMembershipEmail = async (data: {
  name: string;
  reference_code: string;
  cash: number;
  total: number;
  course: string;
  year: number;
  admin: string;
  date: string;
  change: number;
}) => {
  const templatePath = path.join(
    __dirname,
    "../assets/appr-membership-receipt.ejs"
  );
  const html = await ejs.renderFile(templatePath, data);
  return html;
};

const renderOrderEmail = async (data: {
  reference_code: string;
  transaction_date: string;
  student_name: string;
  id_number: string;
  course: string;
  year: number;
  admin: string;
  items: Array<{
    product_name: string;
    batch: string | number;
    sizes: string[];
    variation: string[];
    quantity: number;
    sub_total: number;
  }>;
  cash: number;
  total: number;
}) => {
  const templatePath = path.join(__dirname, "../assets/appr-order-receipt.ejs");
  const html = await ejs.renderFile(templatePath, data);
  return html;
};

const sendWithResend = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL;

  if (!from) throw new Error("EMAIL is not configured");

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
};

export const resendPendingEmails = async () => {
  const pendingEntries = await emailService.fetchByReceipt();

  if (pendingEntries.length === 0) {
    console.log("[1AM PH] No pending emails to resend.");
    return;
  }

  console.log(`[1AM PH] Found ${pendingEntries.length} pending email(s).`);

  let successCount = 0;
  let failedCount = 0;

  for (const rawEntry of pendingEntries) {
    const entry = toPendingEntry(rawEntry);

    try {
      if (entry.retryCount >= MAX_RETRIES) {
        await emailService.markAsFailed(entry._id);
        console.log(
          `[1AM PH] Max retries reached for ${entry.referenceCode}. Marked as failed.`
        );
        failedCount++;
        continue;
      }

      if (entry.subtype === "membership") {
        await resendMembership(entry);
      } else if (entry.subtype === "order") {
        await resendOrder(entry);
      }

      await emailService.updateStatusById(entry._id, "sent");
      successCount++;
      console.log(
        `[1AM PH] Successfully resent ${entry.subtype} receipt for ${entry.referenceCode}`
      );
    } catch (err: any) {
      console.error(
        `[1AM PH] Failed to resend ${entry.subtype} receipt (${entry.referenceCode}):`,
        err.message
      );
      await emailService.incrementRetry(entry._id);
      failedCount++;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    `[1AM PH] Resend complete. Success: ${successCount}, Failed: ${failedCount}`
  );
};

const resendMembership = async (entry: PendingEntry) => {
  const history = await MembershipHistory.findOne({
    reference_code: entry.referenceCode,
  });

  if (!history) {
    throw new Error(`Membership history not found for ${entry.referenceCode}`);
  }

  const cash = history.total;
  const data = {
    name: history.name,
    reference_code: history.reference_code,
    cash,
    total: history.total,
    course: history.course,
    year: history.year,
    admin: history.admin,
    date: format(new Date(history.date), "MMMM d, yyyy"),
    change: 0,
  };

  const html = await renderMembershipEmail(data);
  const logoPath = path.join(__dirname, "../assets/psits.jpg");
  const logoBuffer = await fs.readFile(logoPath);

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL;

  if (!from) throw new Error("EMAIL is not configured");

  const { error } = await resend.emails.send({
    from,
    to: entry.email,
    subject: "Your Receipt from PSITS - UC Main",
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

  if (error) throw new Error(error.message);
};

const resendOrder = async (entry: PendingEntry) => {
  const order = await Orders.findOne({
    reference_code: entry.referenceCode,
  });

  if (!order) {
    throw new Error(`Order not found for ${entry.referenceCode}`);
  }

  const cash = order.total;
  const receiptData = {
    reference_code: order.reference_code,
    transaction_date: order.transaction_date
      ? format(new Date(order.transaction_date), "MMMM d, yyyy")
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
    cash,
    total: order.total,
  };

  const html = await renderOrderEmail(receiptData);
  const logoPath = path.join(__dirname, "../assets/psits.jpg");
  const logoBuffer = await fs.readFile(logoPath);

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL;

  if (!from) throw new Error("EMAIL is not configured");

  const { error } = await resend.emails.send({
    from,
    to: entry.email,
    subject: "Your Order Receipt from PSITS - UC Main",
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

  if (error) throw new Error(error.message);
};
