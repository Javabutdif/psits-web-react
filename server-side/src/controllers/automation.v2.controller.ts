import { Request, Response } from "express";
import { catchAsync } from "../util/catch.async.util";
import {
  createJob,
  updateJob,
  deleteJob,
  getJobs,
  getJobById,
  toggleJobActive,
  executeJob,
  runJobManually,
  getFunctionRegistry,
  getJobExecutionLogs,
} from "../services/automation.service";
import { logService } from "../services/log.service";
import { logs_action } from "../enums/logs.enums";
import { campus_type } from "../enums/campus.enums";

const ALLOWED_CAMPUS = [campus_type.MAIN] as string[];

class AutomationController {
  getJobs = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { isActive, limit, skip } = req.query;
    const { jobs, total } = await getJobs(
      isActive !== undefined ? String(isActive) === "true" : undefined,
      parseInt(String(limit)) || 50,
      parseInt(String(skip)) || 0
    );
    res.status(200).json({ data: jobs, total });
  });

  createJob = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const job = await createJob(req.body, req.admin._id);
    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.CREATE_AUTOMATION_JOB,
      target: job.name,
      target_id: job._id,
      target_model: "AutomationJob",
    });
    res.status(201).json({ data: job });
  });

  getJob = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const job = await getJobById(req.params.id as string);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ data: job });
  });

  updateJob = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const job = await updateJob(req.params.id as string, req.body);
    if (!job) return res.status(404).json({ message: "Job not found" });
    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.UPDATE_AUTOMATION_JOB,
      target: job.name,
      target_id: job._id,
      target_model: "AutomationJob",
    });
    res.status(200).json({ data: job });
  });

  deleteJob = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const deleted = await deleteJob(req.params.id as string);
    if (!deleted) return res.status(404).json({ message: "Job not found" });
    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: logs_action.DELETE_AUTOMATION_JOB,
      target: req.params.id as string,
      target_model: "AutomationJob",
    });
    res.status(200).json({ message: "Job deleted" });
  });

  toggleJob = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const job = await toggleJobActive(req.params.id as string);
    if (!job) return res.status(404).json({ message: "Job not found" });
    await logService.create({
      admin: req.admin.name,
      admin_id: req.admin._id,
      action: job.isActive ? logs_action.CREATE_AUTOMATION_JOB : logs_action.DELETE_AUTOMATION_JOB,
      target: job.name,
      target_id: job._id,
      target_model: "AutomationJob",
    });
    res.status(200).json({ data: job });
  });

  runJob = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const result = await runJobManually(req.params.id as string, req.admin._id);
    res.status(200).json({ data: result });
  });

  getFunctions = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const functions = getFunctionRegistry();
    res.status(200).json({ data: functions });
  });

  getExecutionLogs = catchAsync(async (req: Request, res: Response) => {
    if (!ALLOWED_CAMPUS.includes(req.userV2.campus)) {
      return res.status(403).json({ message: "Campus not authorized" });
    }
    const { limit, skip } = req.query;
    const logs = await getJobExecutionLogs(
      req.params.id as string,
      parseInt(String(limit)) || 20,
      parseInt(String(skip)) || 0
    );
    res.status(200).json({ data: logs });
  });
}

export const automationController = new AutomationController();
