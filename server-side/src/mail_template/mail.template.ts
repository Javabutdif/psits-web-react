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
  studentEmail: string,
  templateRelativePath: string = "templates/certificates/certificate.ejs"
) => {
  try {
    const { CertificateDataSchema } = await import("./mail.schema");
    const { generatePDFFromEJS } =
      await import("./utils/generate-pdf-from-ejs");

    const parsedData = CertificateDataSchema.parse(data);

    const pdfBuffer = await generatePDFFromEJS(
      templateRelativePath,
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

/**
 * Sends an approval email to a recruitment applicant whose application
 * has been approved and volunteer account created.
 */
export const recruitmentApprovedMail = async (data: {
  applicantName: string;
  applicantEmail: string;
  role: string;
  subRole?: string;
}): Promise<void> => {
  let queueEntry: any;

  try {
    queueEntry = await emailService.createByEmail(
      "recruitment",
      data.applicantEmail,
      "approval"
    );

    await sendEmail({
      to: data.applicantEmail,
      subject: "Your PSITS Application Has Been Approved! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Your PSITS Application Has Been Approved! 🎉</h1>
          <p style="color: #555; font-size: 16px;">Dear ${data.applicantName},</p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            Congratulations! 🎉 We're happy to let you know that your application to join PSITS has been approved.
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Role:</strong> ${data.role}</p>
            ${data.subRole ? `<p style="margin: 5px 0;"><strong>Sub-role:</strong> ${data.subRole}</p>` : ""}
          </div>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            Welcome to the team! Keep an eye on your email and our official communication channels for announcements and onboarding details.
          </p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            We're excited to have you with us. See you soon!
          </p>
          <p style="color: #555; font-size: 16px;">— PSITS UC-Main</p>
        </div>
      `,
    });

    await emailService.updateStatusById(String(queueEntry._id), "sent");
  } catch (err: unknown) {
    console.error(
      "Failed to send recruitment approval email:",
      err instanceof Error ? err.message : err
    );
    if (queueEntry) {
      await emailService.updateStatusById(String(queueEntry._id), "failed");
    }
    throw err;
  }
};

/**
 * Sends an interview schedule notification email to a recruitment applicant
 * whose interview has been scheduled. Includes the date, time, and mode
 * (Face-to-Face / Online) with mode-specific instructions.
 */
export const recruitmentInterviewScheduledMail = async (data: {
  applicantName: string;
  applicantEmail: string;
  interviewDate: string;
  interviewTime: string;
  mode: string;
  officer: string;
}): Promise<void> => {
  let queueEntry: any;

  try {
    queueEntry = await emailService.createByEmail(
      "recruitment",
      data.applicantEmail,
      "interview_scheduled"
    );

    await sendEmail({
      to: data.applicantEmail,
      subject: "PSITS Interview Schedule Notification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">PSITS Interview Schedule Notification</h1>
          <p style="color: #555; font-size: 16px;">Dear ${data.applicantName},</p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            We are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0; font-weight: bold; font-size: 16px;">Interview Schedule</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${data.interviewDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${data.interviewTime}</p>
            <p style="margin: 5px 0;"><strong>Mode:</strong> ${data.mode}</p>
            <p style="margin: 5px 0;"><strong>Officer's In-charge:</strong> ${data.officer}</p>
          </div>
          <p style="color: #555; font-size: 16px; margin-bottom: 12px;">
            <strong>For FACE -TO-FACE interview:</strong>
          </p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            Please proceed to <strong>PSITS Office </strong> beside <strong>Room 540</strong> at least <strong>5 minutes before</strong> your scheduled interview time. Kindly bring the documents requested during your application.
          </p>
          <p style="color: #555; font-size: 16px; margin-bottom: 12px;">
            <strong>For ONLINE interview:</strong>
          </p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            A recruitment officer will contact you before your scheduled interview to provide the meeting link and any additional instructions. Please ensure that you are available at the scheduled time and have a stable internet connection.
          </p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            If you have any questions or are unable to attend your scheduled interview, please inform us as soon as possible.
          </p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            We look forward to meeting you and wish you the best of luck.
          </p>
          <p style="color: #555; font-size: 16px;">Best regards,</p>
          <p style="color: #555; font-size: 16px;"><strong>Recruitment Team</strong></p>
          <p style="color: #555; font-size: 16px;">— PSITS UC-Main</p>
        </div>
      `,
    });

    await emailService.updateStatusById(String(queueEntry._id), "sent");
  } catch (err: unknown) {
    console.error(
      "Failed to send recruitment interview scheduled email:",
      err instanceof Error ? err.message : err
    );
    if (queueEntry) {
      await emailService.updateStatusById(String(queueEntry._id), "failed");
    }
    throw err;
  }
};

/**
 * Sends an account-creation email to a verified recruitment applicant whose
 * volunteer account has just been created. Includes the auto-generated login
 * credentials (username + temporary password). Sent only on verification approval
 */
export const recruitmentAccountCreatedMail = async (data: {
  applicantName: string;
  applicantEmail: string;
  role: string;
  subRole?: string;
  username: string;
  tempPassword: string;
}): Promise<void> => {
  let queueEntry: any;

  try {
    queueEntry = await emailService.createByEmail(
      "recruitment",
      data.applicantEmail,
      "account_created"
    );

    await sendEmail({
      to: data.applicantEmail,
      subject: `${"Your PSITS " + data.role} Account Has Been Created! `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">${"Your PSITS " + data.role} Account Has Been Created!</h1>
          <p style="color: #555; font-size: 16px;">Dear ${data.applicantName},</p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            Welcome to the team! Your PSITS ${data.role} account has been successfully created. Below are your login credentials:
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Role:</strong> ${data.role}</p>
            ${data.subRole ? `<p style="margin: 5px 0;"><strong>Sub-role:</strong> ${data.subRole}</p>` : ""}
            <p style="margin: 5px 0;"><strong>Username:</strong> ${data.username}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${data.tempPassword}</p>
          </div>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            You can use your username and temporary password to log in to the PSITS portal. For security, please change your password after your first login.
          </p>
          <p style="color: #999; font-size: 14px; margin-bottom: 16px;">
            If you did not expect this email, please contact your campus PSITS admin.
          </p>
          <p style="color: #555; font-size: 16px;">— PSITS UC-Main</p>
        </div>
      `,
    });

    await emailService.updateStatusById(String(queueEntry._id), "sent");
  } catch (err: unknown) {
    console.error(
      "Failed to send recruitment account created email:",
      err instanceof Error ? err.message : err
    );
    if (queueEntry) {
      await emailService.updateStatusById(String(queueEntry._id), "failed");
    }
    throw err;
  }
};

/**
 * Sends a rejection email to a recruitment applicant whose application
 * has been rejected.
 */
export const recruitmentRejectedMail = async (data: {
  applicantName: string;
  applicantEmail: string;
  reason?: string;
}): Promise<void> => {
  let queueEntry: any;

  try {
    queueEntry = await emailService.createByEmail(
      "recruitment",
      data.applicantEmail,
      "rejection"
    );

    await sendEmail({
      to: data.applicantEmail,
      subject: "Update on Your PSITS Application",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Update on Your PSITS Application</h1>
          <p style="color: #555; font-size: 16px;">Dear ${data.applicantName},</p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            Thank you for expressing your interest in joining PSITS.
          </p>
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            After carefully reviewing all applications, we regret to inform you that your application was not selected for this recruitment period.
          </p>  
          ${data.reason ? `<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;"><p style="margin: 5px 0;"><strong>Reason:</strong> ${data.reason}</p></div>` : ""}
          <p style="color: #555; font-size: 16px; margin-bottom: 16px;">
            We truly appreciate your interest in being part of PSITS and encourage you to apply again in future recruitment periods. We wish you the best, and we hope to see you again in the future!
          </p>
          <p style="color: #555; font-size: 16px;">— PSITS UC-Main</p>
        </div>
      `,
    });

    await emailService.updateStatusById(String(queueEntry._id), "sent");
  } catch (err: unknown) {
    console.error(
      "Failed to send recruitment rejection email:",
      err instanceof Error ? err.message : err
    );
    if (queueEntry) {
      await emailService.updateStatusById(String(queueEntry._id), "failed");
    }
    throw err;
  }
};
