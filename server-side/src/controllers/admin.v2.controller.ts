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
export const setAdminRequestRoleController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.requestRole(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin role request submitted successfully" });
  }
);

export const getAllRequestMemberRoleController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllMemberRequest();
    if (!result) {
      return res.status(400).json({ message: "Failed to get role requests" });
    }
    return res.status(200).json({ data: result });
  }
);
export const getAllRequestAdminAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllAdminRequest();
    if (!result) {
      return res.status(400).json({ message: "Failed to get admin requests" });
    }
    return res.status(200).json({ data: result });
  }
);
export const approveRoleMemberController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.approveMember(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Role request approved successfully" });
  }
);
export const setDeclineMemberRoleController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.declineMember(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Role request declined successfully" });
  }
);
export const addNewAdminAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.create(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin account created successfully" });
  }
);
export const approveAdminAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.approveAdmin(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin account approved successfully" });
  }
);
export const declineAdminAccountController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.declineAdmin(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin account declined successfully" });
  }
);
export const setNewAdminAccessController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.changeAccess(req);
    if (!result.status) {
      return res.status(400).json({ message: result.message });
    }
    return res
      .status(200)
      .json({ message: "Admin access updated successfully" });
  }
);
