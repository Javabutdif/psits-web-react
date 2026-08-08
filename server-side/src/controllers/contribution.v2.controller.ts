import { Request, Response } from "express";
import mongoose from "mongoose";
import { contributionService } from "../services/contribution.service";
import { logService } from "../services/log.service";
import { logs_action } from "../enums/logs.enums";

const logAction = (
  req: Request,
  action: string,
  target: string,
  targetId?: string
) =>
  logService.create({
    admin: req.admin?.name ?? req.userV2?.idNumber ?? "Unknown",
    admin_id: req.admin?._id,
    action,
    target,
    target_id: targetId
      ? new mongoose.Types.ObjectId(targetId)
      : undefined,
    target_model: "Contribution",
  });

export const searchStudentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const query = (req.query.q as string) || "";
    const students = await contributionService.searchStudents(query);
    return res.status(200).json({ data: students });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const getAdminOptionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const admins = await contributionService.getAdminOptions();
    return res.status(200).json({ data: admins });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const getContributionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const type = req.query.type as string | undefined;
    const contributions = await contributionService.getContributions(type);
    return res.status(200).json({ data: contributions });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const getContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const contribution = await contributionService.getContribution(String(id));
    if (!contribution) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Contribution not found" });
    }
    return res.status(200).json({ data: contribution });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const createContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { idNumber, type, description, date } = req.body;

    if (!idNumber || !type || !description || !date) {
      return res
        .status(400)
        .json({ error: "VALIDATION", message: "Missing required fields" });
    }

    if (type !== "developer" && type !== "media" && type !== "volunteer") {
      return res
        .status(400)
        .json({ error: "VALIDATION", message: "Invalid contribution type" });
    }

    const contribution = await contributionService.createContribution(
      { idNumber, type, description, date },
      req.admin?.id_number ?? req.userV2?.idNumber ?? "unknown"
    );

    await logAction(req, logs_action.CREATE_CONTRIBUTION, `${type}: ${description}`, String(contribution._id));

    return res.status(201).json({ data: contribution });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Admin not found") {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Admin not found" });
    }
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const updateContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { description, date } = req.body;

    if (!description && !date) {
      return res
        .status(400)
        .json({ error: "VALIDATION", message: "No fields to update" });
    }

    const contribution = await contributionService.updateContribution(String(id), {
      description,
      date,
    });

    if (!contribution) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Contribution not found" });
    }

    await logAction(req, logs_action.UPDATE_CONTRIBUTION, `${contribution.type} contribution`, String(id));

    return res.status(200).json({ data: contribution });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const deleteContributionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const contribution = await contributionService.deleteContribution(String(id));

    if (!contribution) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Contribution not found" });
    }

    await logAction(req, logs_action.DELETE_CONTRIBUTION, `${contribution.type} contribution`, String(id));

    return res.status(200).json({ message: "Contribution deleted" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const syncDeveloperContributionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await contributionService.syncDeveloperContributions();

    await logAction(
      req,
      logs_action.SYNC_DEVELOPER_CONTRIBUTIONS,
      `Synced ${result.result.developerCount} developers`
    );

    return res.status(200).json({ data: result.result });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const getSyncStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const status = await contributionService.getSyncStatus();
    return res.status(200).json({ data: status });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};

export const setGithubUsernameController = async (
  req: Request,
  res: Response
) => {
  try {
    const idNumber = String(req.params.idNumber);
    const { githubUsername } = req.body;

    if (!idNumber) {
      return res
        .status(400)
        .json({ error: "VALIDATION", message: "idNumber is required" });
    }

    const admin = await contributionService.setAdminGithubUsername(
      idNumber,
      githubUsername
    );

    await logAction(
      req,
      logs_action.UPDATE_GITHUB_USERNAME,
      `Updated GitHub username for ${admin.id_number}`
    );

    return res.status(200).json({ message: "GitHub username updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message === "Admin not found") {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Admin not found" });
    }
    console.error(error);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Internal server error" });
  }
};