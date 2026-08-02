// @ts-nocheck
// src/services/recruitment.service.ts

import { RecruitmentPosition } from "../models/recruitmentPosition.model";
import { Application } from "../models/application.model";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";
import { AppError } from "../util/app.error.util";
import {
  hiringStatus,
  applicationStatus,
  interviewStatus,
} from "../enums/recruitment.enums";
import { account_status, membership_status } from "../enums/status.enums";
import { verifyAccessToken } from "../util/jwt.util";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  recruitmentApprovedMail,
  recruitmentAccountCreatedMail,
  recruitmentInterviewScheduledMail,
  recruitmentRejectedMail,
} from "../mail_template/mail.template";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const OPENING_CONFLICT_STRATEGIES = {
  updateExisting: "update_existing",
  closeOldCreateNew: "close_old_create_new",
};

const toBooleanQuery = (value: any) =>
  value === true || value === "true" || value === "1";

const toPositiveInteger = (value: any, fallback: number) => {
  const parsed = parseInt(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toRequirementList = (value: any) =>
  String(value ?? "")
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

export class RecruitmentService {
  /** Create a new recruitment position */
  async createPosition(req: any) {
    const {
      title,
      description,
      responsibilities,
      requirements,
      isActive,
      applicationDeadline,
      sortOrder,
      slots,
    } = req.body;

    // Validate required fields
    if (!title || !description || !responsibilities || !requirements) {
      throw new AppError(
        "Title, description, responsibilities, and requirements are required.",
        400
      );
    }

    // Validate deadline if provided
    if (applicationDeadline) {
      const deadline = new Date(applicationDeadline);
      if (isNaN(deadline.getTime())) {
        throw new AppError("Invalid application deadline format.", 400);
      }
      // Prevent opening with expired deadline
      const now = Date.now();
      if (isActive && deadline.getTime() < now) {
        throw new AppError(
          "Application deadline must be in future for open positions.",
          400
        );
      }
    }

    const position = new RecruitmentPosition({
      title,
      description,
      responsibilities,
      requirements,
      hiringStatus: hiringStatus.DRAFT, // Default to DRAFT on creation
      isActive: isActive ?? true,
      applicationDeadline,
      sortOrder: sortOrder ?? 0,
      createdBy: req.userV2?.sub || req.admin?._id.toString(),
    });

    await position.save();
    return position;
  }

  /** Admin: bulk-create positions from the "Open Role Application" modal */
  async createPositionsFromOpening(req: any) {
    const {
      startDate,
      endDate,
      startTime,
      endTime,
      roles,
      roleRequirements,
      requirementsByItem,
      conflictStrategy,
    } = req.body;

    if (
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !Array.isArray(roles)
    ) {
      throw new AppError("Missing required fields.", 400);
    }

    const combineDateAndTime = (dateIso: string, time24: string) => {
      const date = new Date(dateIso);
      const [hours, minutes] = time24.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const applicationOpensAt = combineDateAndTime(startDate, startTime);
    const applicationDeadline = combineDateAndTime(endDate, endTime);

    if (applicationDeadline < new Date()) {
      throw new AppError(
        "Application deadline must be in future for open positions.",
        400
      );
    }

    const fallbackRequirements = toRequirementList(roleRequirements);
    const createdBy = req.userV2?.sub || req.admin?._id.toString();
    const docs: any[] = [];
    let sortOrder = 0;

    for (const role of roles) {
      if (!role.enabled) continue;
      const enabledSubPositions = (role.positions || []).filter(
        (p: any) => p.enabled
      );
      if (enabledSubPositions.length === 0) {
        const itemRequirements = toRequirementList(
          requirementsByItem?.[role.id]
        );
        const requirements =
          itemRequirements.length > 0 ? itemRequirements : fallbackRequirements;

        // e.g. "Volunteer" — enabled with no sub-positions
        docs.push({
          title: role.title,
          hiringStatus: hiringStatus.OPEN,
          isActive: true,
          slots: role.slots ?? undefined,
          requirements,
          applicationOpensAt,
          applicationDeadline,
          sortOrder: sortOrder++,
          createdBy,
        });
        continue;
      }

      for (const position of enabledSubPositions) {
        const itemRequirements = toRequirementList(
          requirementsByItem?.[position.id]
        );
        const requirements =
          itemRequirements.length > 0 ? itemRequirements : fallbackRequirements;

        docs.push({
          title: `${role.title} - ${position.name}`,
          hiringStatus: hiringStatus.OPEN,
          isActive: true,
          slots: position.slots ?? undefined,
          requirements,
          applicationOpensAt,
          applicationDeadline,
          sortOrder: sortOrder++,
          createdBy,
        });
      }
    }

    if (docs.length === 0) {
      throw new AppError("No roles or positions were selected.", 400);
    }

    const selectedTitles = docs.map((doc) => doc.title);
    const existingOpenPositions = await RecruitmentPosition.find({
      title: { $in: selectedTitles },
      hiringStatus: hiringStatus.OPEN,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (
      existingOpenPositions.length > 0 &&
      !Object.values(OPENING_CONFLICT_STRATEGIES).includes(conflictStrategy)
    ) {
      return {
        conflict: true,
        conflicts: existingOpenPositions.map((position: any) => ({
          _id: position._id,
          title: position.title,
          slots: position.slots,
          applicationOpensAt: position.applicationOpensAt,
          applicationDeadline: position.applicationDeadline,
          createdAt: position.createdAt,
        })),
      };
    }

    if (
      conflictStrategy === OPENING_CONFLICT_STRATEGIES.closeOldCreateNew &&
      existingOpenPositions.length > 0
    ) {
      await RecruitmentPosition.updateMany(
        {
          _id: {
            $in: existingOpenPositions.map((position: any) => position._id),
          },
        },
        {
          $set: {
            hiringStatus: hiringStatus.CLOSED,
            isActive: false,
          },
        }
      );
      return RecruitmentPosition.insertMany(docs);
    }

    if (conflictStrategy === OPENING_CONFLICT_STRATEGIES.updateExisting) {
      const existingByTitle = existingOpenPositions.reduce(
        (map: Map<string, any[]>, position: any) => {
          const list = map.get(position.title) ?? [];
          list.push(position);
          map.set(position.title, list);
          return map;
        },
        new Map()
      );

      const savedPositions = [];

      for (const doc of docs) {
        const matchingPositions = existingByTitle.get(doc.title) ?? [];
        const [primaryPosition, ...duplicatePositions] = matchingPositions;

        if (!primaryPosition) {
          const created = await RecruitmentPosition.create(doc);
          savedPositions.push(created);
          continue;
        }

        primaryPosition.set({
          slots: doc.slots,
          requirements: doc.requirements,
          applicationOpensAt: doc.applicationOpensAt,
          applicationDeadline: doc.applicationDeadline,
          sortOrder: doc.sortOrder,
          hiringStatus: hiringStatus.OPEN,
          isActive: true,
          createdBy,
        });
        await primaryPosition.save();
        savedPositions.push(primaryPosition);

        if (duplicatePositions.length > 0) {
          await RecruitmentPosition.updateMany(
            {
              _id: {
                $in: duplicatePositions.map((position: any) => position._id),
              },
            },
            {
              $set: {
                hiringStatus: hiringStatus.CLOSED,
                isActive: false,
              },
            }
          );
        }
      }

      return savedPositions;
    }

    return RecruitmentPosition.insertMany(docs);
  }

  /** Get all positions with filtering */
  async listPositions(req: any) {
    const { search, status, page = 1, limit = 10, availableOnly } = req.query;
    const query: any = {};
    const currentPage = toPositiveInteger(page, 1);
    const pageLimit = toPositiveInteger(limit, 10);

    // Public API defaults to only active/open positions unless filtered
    if (req.path.startsWith("/public")) {
      query.isActive = true;
      query.hiringStatus = hiringStatus.OPEN;
    } else {
      if (status) query.hiringStatus = status;
    }

    if (toBooleanQuery(availableOnly)) {
      const now = new Date();
      query.isActive = true;
      query.hiringStatus = hiringStatus.OPEN;
      query.$and = [
        {
          $or: [
            { applicationOpensAt: { $exists: false } },
            { applicationOpensAt: null },
            { applicationOpensAt: { $lte: now } },
          ],
        },
        {
          $or: [
            { applicationDeadline: { $exists: false } },
            { applicationDeadline: null },
            { applicationDeadline: { $gte: now } },
          ],
        },
      ];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const positions = await RecruitmentPosition.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit);

    const total = await RecruitmentPosition.countDocuments(query);

    return {
      positions,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit),
      },
    };
  }

  /** Get a single position by ID */
  async getPositionById(id: string, req?: any) {
    const position = await RecruitmentPosition.findById(id);
    if (!position) throw new AppError("Position not found.", 404);
    return position;
  }

  /** Update a position */
  async updatePosition(id: string, req: any) {
    const position = await RecruitmentPosition.findById(id);
    if (!position) throw new AppError("Position not found.", 404);

    const {
      title,
      description,
      responsibilities,
      requirements,
      hiringStatus: newHiringStatus,
      isActive,
      applicationDeadline,
      sortOrder,
      slots,
    } = req.body;

    if (title) position.title = title;
    if (description) position.description = description;
    if (responsibilities) position.responsibilities = responsibilities;
    if (requirements) position.requirements = requirements;
    if (newHiringStatus !== undefined) position.hiringStatus = newHiringStatus;
    if (isActive !== undefined) position.isActive = isActive;
    if (applicationDeadline)
      position.applicationDeadline = new Date(applicationDeadline);
    if (sortOrder !== undefined) position.sortOrder = sortOrder;
    if (slots !== undefined) position.slots = slots;

    // Validate deadline if position is being opened
    if (
      position.isActive &&
      position.hiringStatus === hiringStatus.OPEN &&
      position.applicationDeadline
    ) {
      const now = Date.now();
      if (
        position.applicationDeadline &&
        position.applicationDeadline.getTime() < now
      ) {
        throw new AppError(
          "Application deadline must be in future for open positions.",
          400
        );
      }
    }

    await position.save();
    return position;
  }

  /** Toggle hiring status (OPEN/CLOSED/DRAFT) */
  async toggleHiringStatus(id: string, req: any) {
    const position = await RecruitmentPosition.findById(id);
    if (!position) throw new AppError("Position not found.", 404);

    const { status } = req.body;
    if (!Object.values(hiringStatus).includes(status as any)) {
      throw new AppError("Invalid hiring status.", 400);
    }

    position.hiringStatus = status as any;
    await position.save();
    return position;
  }

  /** Soft-delete/archive position (remove from active listings) */
  async deletePosition(id: string) {
    const position = await RecruitmentPosition.findById(id);
    if (!position) throw new AppError("Position not found.", 404);

    // Check if there are existing applications - soft disable rather than hard delete
    const hasApplications = await Application.countDocuments({
      position: id,
    }).exec();
    if (hasApplications > 0) {
      position.isActive = false;
      await position.save();
      throw new AppError(
        "Cannot delete position with existing applications. Archive instead.",
        400
      );
    }

    await position.deleteOne();
    return { message: "Position deleted successfully" };
  }

  /** Submit a new application (student endpoint) */
  async submitApplication(positionId: string, req: any) {
    const studentId = req.userV2.sub;
    const position = await RecruitmentPosition.findById(positionId);

    // Validate position exists and is open
    if (!position) throw new AppError("Position not found.", 404);
    if (!position.isActive || position.hiringStatus !== hiringStatus.OPEN) {
      throw new AppError(
        "Position is not currently accepting applications.",
        400
      );
    }

    if (
      position.applicationOpensAt &&
      position.applicationOpensAt > new Date()
    ) {
      throw new AppError("Application is not open yet.", 400);
    }

    // Validate deadline not expired
    if (
      position.applicationDeadline &&
      position.applicationDeadline < new Date()
    ) {
      throw new AppError("Application deadline has passed.", 400);
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({
      position: positionId,
      applicant: studentId,
      status: { $ne: applicationStatus.REJECTED },
    }).exec();

    if (existingApp) {
      throw new AppError(
        "You have already submitted an application for this position.",
        400
      );
    }

    // Get student snapshot for historical record
    const student = await Student.findById(studentId)
      .select("first_name last_name id_number email course year")
      .lean();
    if (!student) throw new AppError("Student not found.", 404);

    // Extract document metadata from request files (multer middleware)
    const files = req.files as any;
    const resume = files.resume?.[0];
    if (!resume) {
      throw new AppError("Resume is required.", 400);
    }

    //Future feature: enable when application letters are required.
    //if (!resume || !applicationLetter) {
    // throw new AppError("Resume and application letter are required.", 400);
    //}

    // Use the key multer-s3 actually uploaded the file to — do NOT
    // regenerate this, since any mismatch means the DB points at an
    // object that doesn't exist in the bucket (NoSuchKey on download).
    const resumeStorageKey = resume.key;
    if (!resumeStorageKey) {
      throw new AppError(
        "Resume upload succeeded but no storage key was returned.",
        500
      );
    }

    const application = new Application({
      position: positionId,
      applicant: studentId,
      applicantSnapshot: {
        name: `${student.first_name || req.body.firstName} ${
          student.last_name || req.body.lastName
        }`.trim(),
        idNumber: student.id_number,
        email: student.email || req.body.email,
        course: student.course || req.body.course,
        year: student.year || req.body.year,
      },
      documents: {
        resume: {
          storageKey: resumeStorageKey,
          originalFilename: resume.originalname,
          mimeType: resume.mimetype,
          size: resume.size,
          uploadTimestamp: new Date(),
        },
        //applicationLetter: {
        //storageKey: letterStorageKey,
        // originalFilename: applicationLetter.originalname,
        // mimeType: applicationLetter.mimetype,
        //size: applicationLetter.size,
        //uploadTimestamp: new Date(),
        // },
      },
      status: applicationStatus.SUBMITTED,
      statusHistory: [
        {
          status: applicationStatus.SUBMITTED,
          changedAt: new Date(),
          changedBy: studentId,
        },
      ],
    });

    try {
      await application.save();
      return application;
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : String(error ?? "Unknown error");

      console.error("Application Save Error:");
      console.error({
        rawMessage,
        positionId,
        applicant: studentId,
        resumeStorageKey,
        resumeFileName: resume?.originalname,
        resumeMimeType: resume?.mimetype,
        resumeSize: resume?.size,
      });

      throw new AppError(`Failed to save application: ${rawMessage}`, 500);
    }
  }

  /** Get current user's applications */
  async getApplicationsForUser(req: any) {
    const studentId = req.userV2.sub;
    const applications = await Application.find({ applicant: studentId })
      .populate("position", "title hiringStatus")
      .sort({ createdAt: -1 });

    // Sanitize response - never expose internalNotes, reviewer info, or
    // volunteer temp credentials to students
    return applications.map((app) => {
      const obj = app.toObject();
      delete obj.internalNotes;
      delete obj.reviewer;
      delete obj.volunteerAccount;
      return obj;
    });
  }

  /** Get a specific application by owner (student) */
  async getApplicationForUser(id: string, req: any) {
    const studentId = req.userV2.sub;
    const app = await Application.findOne({ _id: id, applicant: studentId });

    if (!app)
      throw new AppError(
        "Application not found or you do not have access.",
        404
      );

    const obj = app.toObject();
    delete obj.internalNotes;
    delete obj.reviewer;
    delete obj.volunteerAccount;
    return obj;
  }

  /** Admin: Get paginated applicant list with filters */
  async getApplicants(req: any) {
    const { positionId, status, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (positionId) query.position = positionId;
    if (status) query.status = status;
    if (search)
      query.$or = [
        { "applicantSnapshot.name": { $regex: search, $options: "i" } },
        { "applicantSnapshot.idNumber": { $regex: search, $options: "i" } },
      ];

    const applicants = await Application.find(query)
      .populate("position", "title")
      .populate("applicant", "name id_number email course year")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    return {
      applicants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Admin: Get full application details */
  async getApplicationDetails(id: string) {
    const app = await Application.findById(id)
      .populate("position", "title description responsibilities requirements")
      .populate("applicant", "name id_number email course year");

    if (!app) throw new AppError("Application not found.", 404);

    return app;
  }

  /** Admin: Get a short-lived signed URL to view/download an applicant's resume */
  async getResumeUrl(id: string) {
    const app = await Application.findById(id).select("documents.resume");
    if (!app) throw new AppError("Application not found.", 404);

    const storageKey = app.documents?.resume?.storageKey;
    if (!storageKey) {
      throw new AppError("No resume on file for this application.", 404);
    }

    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      throw new AppError("Resume storage is not configured.", 500);
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 minutes

    return { url, expiresIn: 300 };
  }

  /** Admin: Stream an applicant's resume as an attachment download */
  async getResumeDownload(id: string) {
    const app = await Application.findById(id).select("documents.resume");
    if (!app) throw new AppError("Application not found.", 404);

    const storageKey = app.documents?.resume?.storageKey;
    if (!storageKey) {
      throw new AppError("No resume on file for this application.", 404);
    }

    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      throw new AppError("Resume storage is not configured.", 500);
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    });

    const object = await r2Client.send(command);

    return {
      body: object.Body as NodeJS.ReadableStream,
      fileName: app.documents?.resume?.originalFilename ?? "resume.pdf",
      contentType: object.ContentType ?? "application/octet-stream",
      contentLength: object.ContentLength ?? 0,
    };
  }

  /** Admin: Create the volunteer account for an Approved applicant */
  async verifyApplicantAccount(applicationId: string, req: any) {
    const adminId =
      req.userV2?.sub || (req.admin ? req.admin._id.toString() : null);
    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(applicationId).populate(
      "position",
      "title"
    );
    if (!app) throw new AppError("Application not found.", 404);

    if (app.status !== applicationStatus.APPROVED) {
      throw new AppError("Only approved applications can be verified.", 400);
    }

    if (app.volunteerAccount) {
      throw new AppError(
        "Volunteer account has already been created for this applicant.",
        400
      );
    }

    const idNumber = app.applicantSnapshot.idNumber;
    const username = `psits-${String(idNumber)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")}`;

    // Temp password: 10 chars from an unambiguous alphabet.
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const tempPassword = Array.from({ length: 10 }, () => {
      return chars[randomInt(0, chars.length)];
    }).join("");

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const snapshotName = app.applicantSnapshot.name || "";
    const nameParts = snapshotName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    const yearMatch = String(app.applicantSnapshot.year ?? "").match(/\d+/);
    const year = yearMatch ? Number(yearMatch[0]) : 1;

    const positionTitle = (app.position as any)?.title ?? "";

    // Extract role and sub-role from the position title.
    // e.g. "Developer - Frontend" → role="Developer", subRole="Frontend"
    //      "Volunteer"             → role="Volunteer", subRole=undefined
    const titleParts = positionTitle.split(" - ");
    const role = titleParts[0]?.trim() || "Volunteer";
    const subRole =
      titleParts.length > 1
        ? titleParts.slice(1).join(" - ").trim()
        : undefined;

    // Upsert the student record so the account exists even if the student
    // doc was created out-of-band. `rfid` is a required field on Student,
    // so reuse the (unique) id_number as a stable placeholder.
    await Student.updateOne(
      { _id: app.applicant },
      {
        $set: {
          id_number: idNumber,
          rfid: `RFID-${idNumber}`,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          email: app.applicantSnapshot.email,
          course: app.applicantSnapshot.course,
          year,
          role,
          membershipStatus: membership_status.ACTIVE,
          status: account_status.ACTIVE,
          isFirstApplication: false,
        },
      },
      { upsert: true }
    );

    app.volunteerAccount = {
      username,
      tempPassword,
      createdAt: new Date(),
    };
    app.statusHistory.push({
      status: applicationStatus.APPROVED,
      changedAt: new Date(),
      changedBy: adminId,
      note: "Volunteer account created.",
    });
    await app.save();

    // Send account-creation email with credentials — best-effort, don't
    // block on failure. This is sent only on verification (account creation),
    // not on approval. The approval email is sent separately in
    // updateApplicationStatus when the status changes to APPROVED.
    try {
      await recruitmentAccountCreatedMail({
        applicantName: snapshotName,
        applicantEmail: app.applicantSnapshot.email,
        role,
        subRole,
        username,
        tempPassword,
      });
    } catch (err) {
      console.error(
        "Failed to send recruitment account creation email:",
        err instanceof Error ? err.message : err
      );
    }

    return { username, tempPassword };
  }

  /** Admin: Delete a rejected/withdrawn application */
  async deleteApplication(id: string, req: any) {
    const adminId =
      req.userV2?.sub || (req.admin ? req.admin._id.toString() : null);
    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(id);
    if (!app) throw new AppError("Application not found.", 404);

    // Only terminal, non-actionable states can be deleted. This prevents
    // accidentally removing active/in-progress applications.
    if (
      app.status !== applicationStatus.REJECTED &&
      app.status !== applicationStatus.WITHDRAWN
    ) {
      throw new AppError(
        "Only rejected or withdrawn applications can be deleted.",
        400
      );
    }

    await app.deleteOne();
    return { message: "Application deleted successfully" };
  }

  /** Update application status (admin only) */
  async updateApplicationStatus(id: string, req: any) {
    const { status, note } = req.body;
    const adminId =
      req.userV2.sub || (req.admin ? req.admin._id.toString() : null);

    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(id).populate("position", "title");
    if (!app) throw new AppError("Application not found.", 404);

    // Validate allowed transition
    const allowedTransitions: Record<string, string[]> = {
      [applicationStatus.SUBMITTED]: [
        applicationStatus.INTERVIEW_SCHEDULED,
        applicationStatus.APPROVED,
        applicationStatus.REJECTED,
      ],
      [applicationStatus.INTERVIEW_SCHEDULED]: [
        applicationStatus.INTERVIEWING,
        applicationStatus.APPROVED,
        applicationStatus.REJECTED,
      ],
      [applicationStatus.INTERVIEWING]: [
        applicationStatus.APPROVED,
        applicationStatus.REJECTED,
      ],
    };

    // app.status may be a terminal state (APPROVED/REJECTED/WITHDRAWN) that
    // isn't a key in allowedTransitions at all — default to [] instead of
    // letting `allowedTransitions[app.status]` come back undefined.
    const allowedNextStatuses = allowedTransitions[app.status] ?? [];

    // `.includes()` checks values; the old `status in allowedTransitions[...]`
    // was checking array indices, which is not what was intended.
    if (!allowedNextStatuses.includes(status)) {
      throw new AppError(
        `Invalid status transition from ${app.status} to ${status}.`,
        400
      );
    }

    app.status = status;
    app.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: adminId,
      note,
    });
    app.reviewer = adminId;
    app.internalNotes =
      (app.internalNotes || "") +
      `\n[${new Date().toISOString()}] ${note || ""}`;

    await app.save();

    // Send rejection email automatically when the decision is REJECTED
    if (status === applicationStatus.REJECTED) {
      try {
        await recruitmentRejectedMail({
          applicantName: app.applicantSnapshot.name || "",
          applicantEmail: app.applicantSnapshot.email || "",
          reason: note || undefined,
        });
      } catch (err) {
        console.error(
          "Failed to send recruitment rejection email:",
          err instanceof Error ? err.message : err
        );
      }
    }

    // Send approval email automatically when the decision is APPROVED.
    // The account-creation email (with credentials) is sent separately
    // later in verifyApplicantAccount when the volunteer account is created.
    if (status === applicationStatus.APPROVED) {
      try {
        const positionTitle = (app.position as any)?.title ?? "";
        const titleParts = positionTitle.split(" - ");
        const role = titleParts[0]?.trim() || "Volunteer";
        const subRole =
          titleParts.length > 1
            ? titleParts.slice(1).join(" - ").trim()
            : undefined;

        await recruitmentApprovedMail({
          applicantName: app.applicantSnapshot.name || "",
          applicantEmail: app.applicantSnapshot.email || "",
          role,
          subRole,
        });
      } catch (err) {
        console.error(
          "Failed to send recruitment approval email:",
          err instanceof Error ? err.message : err
        );
      }
    }

    return app;
  }

  /** Schedule an interview */
  async createInterview(applicationId: string, req: any) {
    const adminId =
      req.userV2.sub || (req.admin ? req.admin._id.toString() : null);
    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(applicationId);
    if (!app) throw new AppError("Application not found.", 404);

    const { scheduledAt, location, notes } = req.body;

    if (!scheduledAt)
      throw new AppError("Scheduled date/time is required.", 400);

    const interviewDate = new Date(scheduledAt);
    if (interviewDate < new Date()) {
      throw new AppError("Interview date must be in the future.", 400);
    }

    app.interview = {
      scheduledAt: interviewDate,
      location: location || "",
      notes: notes || "",
      status: "SCHEDULED" as const,
      scheduledBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    app.status = applicationStatus.INTERVIEW_SCHEDULED;
    app.statusHistory.push({
      status: applicationStatus.INTERVIEW_SCHEDULED,
      changedAt: new Date(),
      changedBy: adminId,
      note: "Interview scheduled.",
    });
    app.reviewer = adminId;
    app.internalNotes =
      (app.internalNotes || "") +
      `\n[${new Date().toISOString()}] Interview scheduled. ${location || ""}`;

    await app.save();

    // Send interview schedule notification email — best-effort, don't
    // block on failure. Parses the interview mode from the notes field
    // (stored as "Interview type: [type]; ...") and formats the date/time
    // from the scheduledAt timestamp.
    try {
      const scheduledAt = app.interview.scheduledAt;
      const dateStr = scheduledAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeStr = scheduledAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      const modeMatch = (notes || "").match(/Interview type:\s*(.+?)(?:;|$)/i);
      const mode = modeMatch?.[1]?.trim() || "Face-to-Face";

      await recruitmentInterviewScheduledMail({
        applicantName: app.applicantSnapshot.name || "",
        applicantEmail: app.applicantSnapshot.email || "",
        interviewDate: dateStr,
        interviewTime: timeStr,
        mode,
      });
    } catch (err) {
      console.error(
        "Failed to send interview schedule email:",
        err instanceof Error ? err.message : err
      );
    }

    return app;
  }

  /** Update/reschedule an interview */
  async updateInterview(applicationId: string, req: any) {
    const adminId =
      req.userV2.sub || (req.admin ? req.admin._id.toString() : null);
    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(applicationId);
    if (!app) throw new AppError("Application not found.", 404);

    if (!app.interview)
      throw new AppError("No interview scheduled for this application.", 400);

    const { scheduledAt, location, notes, status } = req.body;

    if (scheduledAt) {
      const interviewDate = new Date(scheduledAt);
      if (interviewDate < new Date()) {
        throw new AppError("Interview date must be in the future.", 400);
      }
      app.interview.scheduledAt = interviewDate;
    }
    if (location !== undefined) app.interview.location = location;
    if (notes !== undefined) app.interview.notes = notes;
    if (status !== undefined) {
      if (!Object.values(interviewStatus).includes(status as any)) {
        throw new AppError("Invalid interview status.", 400);
      }
      app.interview.status = status as any;
    }
    app.interview.updatedAt = new Date();
    app.interview.scheduledBy = adminId;

    await app.save();
    return app;
  }

  /** Cancel/remove interview */
  async deleteInterview(applicationId: string) {
    const app = await Application.findById(applicationId);
    if (!app) throw new AppError("Application not found.", 404);

    if (!app.interview) throw new AppError("No interview to cancel.", 400);

    app.interview.status = "CANCELLED" as const;
    app.interview.updatedAt = new Date();

    await app.save();
    return app;
  }
}

export const recruitmentService = new RecruitmentService();
