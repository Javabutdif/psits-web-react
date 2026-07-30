import ejs from "ejs";
import path from "path";
import fs from "fs/promises";
import { Resend } from "resend";
import {
  IMembershipRequest,
  IOrderReceipt,
  TCertificateData,
} from "./mail.interface";
// dynamic imports for schema and PDF generator are used below to avoid
// circular import issues at runtime

import dotenv from "dotenv";
dotenv.config();

import { emailService } from "../services/email.service";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
};

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename?: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
    contentId?: string;
  }>;
};

const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: SendEmailOptions) => {
  const from = process.env.EMAIL;

  if (!from) {
    throw new Error("EMAIL is not configured");
  }

  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    attachments,
  });

  if (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};

export const membershipRequestReceipt = async (
  data: IMembershipRequest,
  studenteEmail: string,
  studentId?: string | null,
  referenceCode?: string
) => {
  if (!studenteEmail || !studentId || !referenceCode) {
    return;
  }

  const emailTemplate = await ejs.renderFile(
    path.join(__dirname, "../assets/appr-membership-receipt.ejs"),
    data
  );

  const logoPath = path.join(__dirname, "../assets/psits.jpg");
  const logoBuffer = await fs.readFile(logoPath);

  try {
    const queueEntry = await emailService.createByEmail(
      "receipt",
      studenteEmail,
      "membership",
      referenceCode
    );

    await sendEmail({
      to: studenteEmail,
      subject: "Your Receipt from PSITS - UC Main",
      html: emailTemplate,
      attachments: [
        {
          filename: "psits.jpg",
          content: logoBuffer,
          contentType: "image/jpeg",
          contentId: "logo",
        },
      ],
    });

    await emailService.updateStatusById(String(queueEntry._id), "sent");
  } catch (err: unknown) {
    console.error(
      "Failed to send membership request receipt email:",
      err instanceof Error ? err.message : err
    );
  }
};

export const orderReceipt = async (
  data: IOrderReceipt,
  studentEmail: string,
  studentId?: string | null,
  referenceCode?: string
) => {
  if (!studentEmail || !studentId || !referenceCode) {
    return;
  }

  const emailTemplate = await ejs.renderFile(
    path.join(__dirname, "../assets/appr-order-receipt.ejs"),
    data
  );
  const logoPath = path.join(__dirname, "../assets/psits.jpg");
  const logoBuffer = await fs.readFile(logoPath);

  try {
    const queueEntry = await emailService.createByEmail(
      "receipt",
      studentEmail,
      "order",
      referenceCode
    );

    await sendEmail({
      to: studentEmail,
      subject: "Your Order Receipt from PSITS - UC Main",
      html: emailTemplate,
      attachments: [
        {
          filename: "psits.jpg",
          content: logoBuffer,
          contentType: "image/jpeg",
          contentId: "logo",
        },
      ],
    });

    await emailService.updateStatusById(String(queueEntry._id), "sent");
  } catch (err: unknown) {
    console.error(
      "Failed to send order receipt email:",
      err instanceof Error ? err.message : err
    );
  }
};

export const attendeeRegistrationMail = async (data: {
  studentName: string;
  studentEmail: string;
  eventName: string;
  campus: string;
  studentId: string;
  password: string;
}): Promise<void> => {
  await sendEmail({
    to: data.studentEmail,
    subject: `PSITS - Event Registration Confirmation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">PSITS - Registration Confirmation</h1>
        <p style="color: #555; font-size: 16px;">Hello ${data.studentName},</p>
        <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
          Your account has been successfully created and you have been registered as an attendee for the following event:
        </p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Event:</strong> ${data.eventName}</p>
          <p style="margin: 5px 0;"><strong>Campus:</strong> ${data.campus}</p>
          <p style="margin: 5px 0;"><strong>Student ID:</strong> ${data.studentId}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${data.password}</p>
        </div>
        <p style="color: #555; font-size: 16px;">
          You can use your Student ID and password to log in to the PSITS portal.
        </p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you did not expect this email, please contact your campus PSITS admin.
        </p>
        <p style="color: #555; font-size: 16px;">Thank you,</p>
        <p style="color: #555; font-size: 16px;">The PSITS Team</p>
      </div>
    `,
  });
};

export const forgotPasswordMail = async (
  studentMail: string,
  url: string,
  token: string
) => {
  let queueEntry: any;

  try {
    queueEntry = await emailService.createByEmail(
      "auth",
      studentMail,
      "password_reset",
      token.slice(0, 8)
    );
    await sendEmail({
      to: studentMail,
      subject: "Reset Your Password",
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">PSITS - Reset Your Password</h1>
              <p style="color: #555; font-size: 16px;">Hello,</p>
              <p style="color: #555; font-size: 16px; margin-bottom: 20px">
                We received a request to reset your password. Click the button below to reset it:
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a
                  href="${url}${token}"
                  style="display: inline-block; padding: 20px 25px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px; font-size: 24px;">
                  Reset Password
                </a>
              </div>
              <p style="color: #555; font-size: 16px;">Or you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">
                <a href="${url}${token}" style="color: #007bff;">
                 ${url}${token}
                </a>
              </p>
              <p style="color: #999; font-size: 14px;">
                This link will expire in 10 minutes. If you didn’t request a password reset, you can safely ignore this email.
              </p>
              <p style="color: #555; font-size: 16px;">Thank you,</p>
              <p style="color: #555; font-size: 16px;">The Support Team</p>
            </div>
          `,
    });

    await emailService.updateStatusById(queueEntry._id.toString(), "sent");

    return { status: true, message: "Email Sent" };
  } catch (err: any) {
    console.error("Failed to send forgot password email:", err.message);
    if (queueEntry) {
      await emailService.updateStatusById(queueEntry._id.toString(), "failed");
    }
    throw err; // let the caller know the reset email actually failed
  }
};

/**
 * Sends an autmated certificate of participation to a single email
 */
export const certificateOfParticipationEmail = async (
  data: TCertificateData,
  studentEmail: string
) => {
  try {
    const { CertificateDataSchema } = await import("./mail.schema");
    const { generatePDFFromEJS } =
      await import("./utils/generate-pdf-from-ejs");

    const parsedData = CertificateDataSchema.parse(data);

    const pdfBuffer = await generatePDFFromEJS(
      "ejs/pdf-ejs/certificate.ejs",
      parsedData
    );

    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../assets/ejs/cert-participation-mail-body.ejs"),
      parsedData,
      { cache: true }
    );

    const fileName = `${parsedData.student_name}-CERT.pdf`.toUpperCase();

    await sendEmail({
      to: studentEmail,
      subject: `Congratulations for Attending ${parsedData.event_name}!`,
      html: emailTemplate,
      attachments: [
        {
          filename: fileName,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ],
    });

    return {
      status: true,
      message: `Cert of participation for ${parsedData.student_name} Sent`,
    };
  } catch (err: any) {
    console.error(
      "Unexpected errors when attempting to send/process certificate email: ",
      err.message
    );
    throw err;
  }
};
