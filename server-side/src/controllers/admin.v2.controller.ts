import { Request, Response } from "express";
import { studentService } from "../services/student.service";
import { adminService } from "../services/admin.service";
import { merchandiseService } from "../services/merchandise.service";
import { orderService } from "../services/order.service";
import { user_model } from "../model_template/model_data";
import { catchAsync } from "../util/catch.async.util";

export const getSearchStudentByIdController = catchAsync(
  async (req: Request, res: Response) => {
    const { id_number } = req.params;

    const student = await studentService.getSpecific(id_number);

    return res.status(200).json({ data: user_model(student) });
  }
);

export const getStudentCountController = catchAsync(
  async (req: Request, res: Response) => {
    const response = await studentService.count();

    res.status(200).json(response);
  }
);

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const studentCount = await adminService.getAdminDashboardCount();
    const merchCount = await merchandiseService.getPublishCount();
    const pendingCount = await orderService.getPendingCount();
    const dailySales = await orderService.getDailySales();

    res
      .status(200)
      .json({ studentCount, merchCount, pendingCount, dailySales });
  }
);

export const getAllAdminController = catchAsync(
  async (req: Request, res: Response) => {
    const admins = await adminService.getAll(req);
    res.status(200).json({ data: admins });
  }
);
export const getAllAdminMembersController = catchAsync(
  async (req: Request, res: Response) => {
    const admins = await adminService.getAllMembers();
    res.status(200).json({ data: admins });
  }
);
export const getAllSuspendAdminAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const admins = await adminService.getAllSuspend();
    res.status(200).json({ data: admins });
  }
);
export const editAdminController = catchAsync(
  async (req: Request, res: Response) => {
    const result = adminService.editAdmin(req);

    if (!result) {
      return res.status(400).json({ message: "Failed to edit admin account" });
    }
    return res
      .status(200)
      .json({ message: "Admin account edited successfully" });
  }
);
export const changeAdminPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.changePassword(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(200).json({ message: "Password changed successfully" });
  }
);
export const setSuspendAdminAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.suspend(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin account suspended successfully" });
  }
);
export const setMemberRoleRemoveController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.removeRole(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin account role updated successfully" });
  }
);
export const setRestoreAdminAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.restore(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin account restored successfully" });
  }
);
