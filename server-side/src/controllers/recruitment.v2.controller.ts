// src/controllers/recruitment.v2.controller.ts

import { Request, Response } from "express";
import {
  RecruitmentPosition,
  IRecruitmentPosition,
} from "../models/recruitmentPosition.model";
import { Application } from "../models/application.model";
import { catchAsync } from "../util/catch.async.util";
import { hiringStatus } from "../enums/recruitment.enums";
import { recruitmentService } from "../services/recruitment.service";
import { logService } from "../services/log.service";
import { logs_action } from "../enums/logs.enums";
import { AppError } from "../util/app.error.util";

const logAdminAction = (
  req: Request,
  action: string,
  target: string,
  target_id?: string
) =>
  logService.create({
    admin: req.admin?.name ?? "Unknown Admin",
    admin_id: req.admin?._id,
    action,
    target,
    target_id: target_id && /^[a-f\d]{24}$/i.test(target_id) ? target_id : undefined,
    target_model: "Recruitment",
  });

class RecruitmentController {
  /** Public: List all open positions */
  listPositions = catchAsync(async (req: Request, res: Response) => {
    const result = await recruitmentService.listPositions(req);
    return res
      .status(200)
      .json({ message: "Positions retrieved successfully", data: result });
  });

  /** Public: Get single position by ID */
  getPositionById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const position = await recruitmentService.getPositionById(id);
    return res
      .status(200)
      .json({ message: "Position retrieved successfully", data: position });
  });

  /** Admin: Create a new position */
  createPosition = catchAsync(async (req: Request, res: Response) => {
    const position = await recruitmentService.createPosition(req);
    await logAdminAction(req, logs_action.CREATE_POSITION, position?.title, String(position?._id));
    return res
      .status(201)
      .json({ message: "Position created successfully", data: position });
  });

  /** Admin: Create positions in bulk from the Open Role Application modal */
  createPositionsFromOpening = catchAsync(
    async (req: Request, res: Response) => {
      const positions =
        await recruitmentService.createPositionsFromOpening(req);
      if (!Array.isArray(positions) && positions?.conflict) {
        return res.status(409).json({
          code: "RECRUITMENT_POSITION_CONFLICT",
          message: "Some selected role applications are already open.",
          data: positions,
        });
      }
      await logAdminAction(req, logs_action.CREATE_POSITION, "Bulk open role applications");
      return res.status(201).json({
        message: "Positions opened successfully",
        data: positions,
      });
    }
  );

  /** Admin: Update a position */
  updatePosition = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const position = await recruitmentService.updatePosition(id, req);
    await logAdminAction(req, logs_action.UPDATE_POSITION, position?.title, String(position?._id));
    return res
      .status(200)
      .json({ message: "Position updated successfully", data: position });
  });

  /** Admin: Toggle hiring status */
  toggleHiringStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const position = await recruitmentService.toggleHiringStatus(id, req);
    await logAdminAction(req, logs_action.TOGGLE_HIRING, position?.title, String(position?._id));
    return res
      .status(200)
      .json({ message: "Hiring status updated successfully", data: position });
  });

  /** Admin: Delete/archive position */
  deletePosition = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await recruitmentService.deletePosition(id);
    await logAdminAction(req, logs_action.DELETE_POSITION, String(id), id);
    return res.status(200).json({ message: "Position archived successfully" });
  });

  /** Student: Submit application with multipart files */
  submitApplication = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const application = await recruitmentService.submitApplication(id, req);
    return res.status(201).json({
      message: "Application submitted successfully",
      data: application,
    });
  });

  /** Student: Get current user's applications */
  getApplicationsForUser = catchAsync(async (req: Request, res: Response) => {
    const applications = await recruitmentService.getApplicationsForUser(req);
    return res.status(200).json({
      message: "Retrieved your applications successfully",
      data: applications,
    });
  });

  /** Student: Get specific application (owner only) */
  getApplicationForUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.getApplicationForUser(id, req);
    return res
      .status(200)
      .json({ message: "Application retrieved successfully", data: app });
  });

  /** Admin: Get paginated applicant list with filters */
  getApplicants = catchAsync(async (req: Request, res: Response) => {
    const result = await recruitmentService.getApplicants(req);
    return res
      .status(200)
      .json({ message: "Applicants retrieved successfully", data: result });
  });

  /** Admin: Get full application details */
  getApplicationDetails = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.getApplicationDetails(id);
    return res
      .status(200)
      .json({ message: "Application details retrieved", data: app });
  });

  /** Admin: Get a signed URL for an applicant's resume */
  getResumeUrl = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await recruitmentService.getResumeUrl(id);
    return res
      .status(200)
      .json({ message: "Resume URL generated successfully", data: result });
  });

  /** Admin: Download an applicant's resume as a file attachment */
  downloadResume = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await recruitmentService.getResumeDownload(id);

    res.setHeader("Content-Type", result.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`
    );
    res.setHeader("Content-Length", String(result.contentLength));

    return result.body.pipe(res);
  });

  /** Admin: Update application status */
  updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.updateApplicationStatus(id, req);
    const targetStatus = String(app?.status ?? "").toUpperCase();
    const action =
      targetStatus === "APPROVED"
        ? logs_action.APPROVE_APPLICANT
        : targetStatus === "REJECTED" || targetStatus === "WITHDRAWN"
          ? logs_action.REJECT_APPLICANT
          : logs_action.APPLICATION_STATUS_UPDATE;
    await logAdminAction(req, action, app?.applicantSnapshot?.name || String(id), id);
    return res
      .status(200)
      .json({ message: "Application status updated successfully", data: app });
  });

  /** Admin: Delete a rejected/withdrawn application */
  deleteApplication = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await recruitmentService.deleteApplication(id, req);
    await logAdminAction(req, logs_action.DELETE_APPLICATION, String(id), id);
    return res.status(200).json(result);
  });

  /** Admin: Create the volunteer account for an Approved applicant */
  verifyApplicantAccount = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const account =
      await recruitmentService.verifyApplicantAccount(id, req);
    await logAdminAction(req, logs_action.VERIFY_APPLICANT, String(id), id);
    return res.status(201).json({
      message: "Volunteer account created successfully",
      data: account,
    });
  });

  /** Admin: Schedule interview */
  createInterview = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.createInterview(id, req);
    await logAdminAction(req, logs_action.CREATE_INTERVIEW, app?.applicantSnapshot?.name || String(id), id);
    return res
      .status(201)
      .json({ message: "Interview scheduled successfully", data: app });
  });

  /** Admin: Reschedule/update interview */
  updateInterview = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.updateInterview(id, req);
    await logAdminAction(req, logs_action.UPDATE_INTERVIEW, app?.applicantSnapshot?.name || String(id), id);
    return res
      .status(200)
      .json({ message: "Interview updated successfully", data: app });
  });

  /** Admin: Cancel interview */
  cancelInterview = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.deleteInterview(id);
    await logAdminAction(req, logs_action.CANCEL_INTERVIEW, app?.applicantSnapshot?.name || String(id), id);
    return res
      .status(200)
      .json({ message: "Interview cancelled successfully", data: app });
  });
}

export const recruitmentController = new RecruitmentController();
