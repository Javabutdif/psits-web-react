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
import { AppError } from "../util/app.error.util";

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
    return res
      .status(201)
      .json({ message: "Position created successfully", data: position });
  });

  /** Admin: Create positions in bulk from the Open Role Application modal */
  createPositionsFromOpening = catchAsync(
    async (req: Request, res: Response) => {
      const positions =
        await recruitmentService.createPositionsFromOpening(req);
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
    return res
      .status(200)
      .json({ message: "Position updated successfully", data: position });
  });

  /** Admin: Toggle hiring status */
  toggleHiringStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const position = await recruitmentService.toggleHiringStatus(id, req);
    return res
      .status(200)
      .json({ message: "Hiring status updated successfully", data: position });
  });

  /** Admin: Delete/archive position */
  deletePosition = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await recruitmentService.deletePosition(id);
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

  /** Admin: Update application status */
  updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.updateApplicationStatus(id, req);
    return res
      .status(200)
      .json({ message: "Application status updated successfully", data: app });
  });

  /** Admin: Schedule interview */
  createInterview = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.createInterview(id, req);
    return res
      .status(201)
      .json({ message: "Interview scheduled successfully", data: app });
  });

  /** Admin: Reschedule/update interview */
  updateInterview = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.updateInterview(id, req);
    return res
      .status(200)
      .json({ message: "Interview updated successfully", data: app });
  });

  /** Admin: Cancel interview */
  cancelInterview = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const app = await recruitmentService.deleteInterview(id);
    return res
      .status(200)
      .json({ message: "Interview cancelled successfully", data: app });
  });
}

export const recruitmentController = new RecruitmentController();
