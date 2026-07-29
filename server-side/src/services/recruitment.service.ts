// @ts-nocheck
// src/services/recruitment.service.ts

import { RecruitmentPosition } from "../models/recruitmentPosition.model";
import { Application } from "../models/application.model";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";
import { AppError } from "../util/app.error.util";
import { hiringStatus, applicationStatus, interviewStatus } from "../enums/recruitment.enums";
import { verifyAccessToken } from "../util/jwt.util";

export class RecruitmentService {
  /** Create a new recruitment position */
  async createPosition(req: any) {
    const { title, description, responsibilities, requirements, isActive, applicationDeadline, sortOrder } = req.body;

    // Validate required fields
    if (!title || !description || !responsibilities || !requirements) {
      throw new AppError("Title, description, responsibilities, and requirements are required.", 400);
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
        throw new AppError("Application deadline must be in future for open positions.");
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

  /** Get all positions with filtering */
  async listPositions(req: any) {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Public API defaults to only active/open positions unless filtered
    if (req.path.startsWith('/public')) {
      query.isActive = true;
      query.hiringStatus = hiringStatus.OPEN;
    } else {
      if (status) query.hiringStatus = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const positions = await RecruitmentPosition.find(query)
      .sort({ sortOrder: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await RecruitmentPosition.countDocuments(query);

    return {
      positions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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

    const { title, description, responsibilities, requirements, hiringStatus, isActive, applicationDeadline, sortOrder } = req.body;

    if (title) position.title = title;
    if (description) position.description = description;
    if (responsibilities) position.responsibilities = responsibilities;
    if (requirements) position.requirements = requirements;
    if (hiringStatus !== undefined) position.hiringStatus = hiringStatus;
    if (isActive !== undefined) position.isActive = isActive;
    if (applicationDeadline) position.applicationDeadline = new Date(applicationDeadline);
    if (sortOrder !== undefined) position.sortOrder = sortOrder;

      // Validate deadline if position is being opened
      if (position.isActive && position.hiringStatus === hiringStatus.OPEN && position.applicationDeadline) {
        const now = Date.now();
        if (position.applicationDeadline && position.applicationDeadline.getTime() < now) {
          throw new AppError("Application deadline must be in future for open positions.");
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
    const hasApplications = await Application.countDocuments({ position: id }).exec();
    if (hasApplications > 0) {
      position.isActive = false;
      await position.save();
      throw new AppError("Cannot delete position with existing applications. Archive instead.", 400);
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
      throw new AppError("Position is not currently accepting applications.", 400);
    }

    // Validate deadline not expired
    if (position.applicationDeadline && position.applicationDeadline < new Date()) {
      throw new AppError("Application deadline has passed.", 400);
    }

    // Check for duplicate application
    const existingApp = await Application.findOne({
      position: positionId,
      applicant: studentId,
      status: { $ne: applicationStatus.REJECTED },
    }).exec();

    if (existingApp) {
      throw new AppError("You have already submitted an application for this position.", 400);
    }

    // Get student snapshot for historical record
    const student = await Student.findById(studentId).select('name id_number email').lean();
    if (!student) throw new AppError("Student not found.", 404);

    // Extract document metadata from request files (multer middleware)
    const { resume, applicationLetter } = req.files as any;
    if (!resume || !applicationLetter) {
      throw new AppError("Resume and application letter are required.", 400);
    }

// Generate simple storage keys based on identifiers
const resumeStorageKey = `recruitment/${positionId}/resume/${studentId}_${Date.now()}.pdf`;
const letterStorageKey = `recruitment/${positionId}/letter/${studentId}_${Date.now()}.pdf`;

    const application = new Application({
      position: positionId,
      applicant: studentId,
      applicantSnapshot: {
        name: `${student.first_name} ${student.last_name}`.trim(),
        idNumber: student.id_number,
        email: student.email,
      },
      documents: {
        resume: {
          storageKey: resumeStorageKey,
          originalFilename: resume.originalname,
          mimeType: resume.mimetype,
          size: resume.size,
          uploadTimestamp: new Date(),
        },
        applicationLetter: {
          storageKey: letterStorageKey,
          originalFilename: applicationLetter.originalname,
          mimeType: applicationLetter.mimetype,
          size: applicationLetter.size,
          uploadTimestamp: new Date(),
        },
      },
      status: applicationStatus.SUBMITTED,
      statusHistory: [{
        status: applicationStatus.SUBMITTED,
        changedAt: new Date(),
        changedBy: studentId,
      }],
    });

    try {
      await application.save();
      // TODO: Upload documents to storage/S3 after saving application to maintain consistency
      // If upload fails, clean up partial application
      return application;
    } catch (error) {
      throw new AppError("Failed to save application.", 500);
    }
  }

  /** Get current user's applications */
  async getApplicationsForUser(req: any) {
    const studentId = req.userV2.sub;
    const applications = await Application.find({ applicant: studentId })
      .populate('position', 'title hiringStatus')
      .sort({ createdAt: -1 });

    // Sanitize response - never expose internalNotes or reviewer info to students
    return applications.map(app => {
        const obj = app.toObject();
        delete obj.internalNotes;
        delete obj.reviewer;
        return obj;
      });
  }

  /** Get a specific application by owner (student) */
  async getApplicationForUser(id: string, req: any) {
    const studentId = req.userV2.sub;
    const app = await Application.findOne({ _id: id, applicant: studentId });

    if (!app) throw new AppError("Application not found or you do not have access.", 404);

    return app;
  }

  /** Admin: Get paginated applicant list with filters */
  async getApplicants(req: any) {
    const { positionId, status, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (positionId) query.position = positionId;
    if (status) query.status = status;
    if (search) query.$or = [
      { 'applicantSnapshot.name': { $regex: search, $options: 'i' } },
      { 'applicantSnapshot.idNumber': { $regex: search, $options: 'i' } },
    ];

    const applicants = await Application.find(query)
      .populate('position', 'title')
      .populate('applicant', 'name id_number email')
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
      .populate('position', 'title description responsibilities requirements')
      .populate('applicant', 'name id_number email course year');

    if (!app) throw new AppError("Application not found.", 404);

    return app;
  }

  /** Update application status (admin only) */
  async updateApplicationStatus(id: string, req: any) {
    const { status, note } = req.body;
    const adminId = req.userV2.sub || (req.admin ? req.admin._id.toString() : null);

    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(id);
    if (!app) throw new AppError("Application not found.", 404);

    // Validate allowed transition
    const allowedTransitions = {
      [applicationStatus.SUBMITTED]: [applicationStatus.INTERVIEW_SCHEDULED, applicationStatus.REJECTED],
      [applicationStatus.INTERVIEW_SCHEDULED]: [applicationStatus.INTERVIEWING, applicationStatus.REJECTED],
      [applicationStatus.INTERVIEWING]: [applicationStatus.APPROVED, applicationStatus.REJECTED],
    };

    if (!(status in allowedTransitions[app.status])) {
      throw new AppError(`Invalid status transition from ${app.status} to ${status}.`, 400);
    }

    app.status = status;
    app.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: adminId,
      note,
    });
    app.reviewer = adminId;
    app.internalNotes = (app.internalNotes || '') + `\n[${new Date().toISOString()}] ${note || ''}`;

    await app.save();
    return app;
  }

  /** Schedule an interview */
  async createInterview(applicationId: string, req: any) {
    const adminId = req.userV2.sub || (req.admin ? req.admin._id.toString() : null);
    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(applicationId);
    if (!app) throw new AppError("Application not found.", 404);

    const { scheduledAt, location, notes } = req.body;

    if (!scheduledAt) throw new AppError("Scheduled date/time is required.", 400);

    const interviewDate = new Date(scheduledAt);
    if (interviewDate < new Date()) {
      throw new AppError("Interview date must be in the future.", 400);
    }

    app.interview = {
      scheduledAt: interviewDate,
      location: location || '',
      notes: notes || '',
      status: "SCHEDULED" as const,
      scheduledBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await app.save();
    return app;
  }

  /** Update/reschedule an interview */
  async updateInterview(applicationId: string, req: any) {
    const adminId = req.userV2.sub || (req.admin ? req.admin._id.toString() : null);
    if (!adminId) throw new AppError("Authentication required.", 401);

    const app = await Application.findById(applicationId);
    if (!app) throw new AppError("Application not found.", 404);

    if (!app.interview) throw new AppError("No interview scheduled for this application.", 400);

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
