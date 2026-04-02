import { Request } from "express";
import { Student } from "../models/student.model";
import { IStudent } from "../models/student.interface";
import { Admin } from "../models/admin.model";
import { IAdmin } from "../models/admin.interface";
import { IAdminDocument } from "../models/admin.interface";
import { admin_model, role_model } from "../model_template/model_data";
import { account_status } from "../enums/status.enums";
import { psits_roles, student_roles } from "../enums/role.enums";
import { logService } from "./log.service";
import { logs_action } from "../enums/logs.enums";
import bcrypt from "bcryptjs";
import { studentService } from "./student.service";
import { orderService } from "./order.service";

class AdminService {
  //Update One Dynamic Admin
  updateOneDynamic = async (id_number: String, parameters: any) => {
    try {
      const result = await Admin.updateOne({ id_number }, { $set: parameters });

      if (result.matchedCount === 0) {
        return { status: false, message: "Admin not found" };
      }

      if (result.modifiedCount === 0) {
        return { status: true, message: "No changes made" };
      }

      return { status: true, message: "Admin updated successfully" };
    } catch (error) {
      return { status: false, message: "Error updating student", error };
    }
  };
  //Admin Dashboard Count
  getAdminDashboardCount = async () => {
    try {
      const [
        bsitCount,
        bscsCount,
        actCount,
        year1Count,
        year2Count,
        year3Count,
        year4Count,
      ] = await Promise.all([
        Student.countDocuments({ course: "BSIT" }),
        Student.countDocuments({ course: "BSCS" }),
        Student.countDocuments({ course: "ACT" }),
        Student.countDocuments({ year: "1" }),
        Student.countDocuments({ year: "2" }),
        Student.countDocuments({ year: "3" }),
        Student.countDocuments({ year: "4" }),
      ]);

      return {
        courses: {
          BSIT: bsitCount,
          BSCS: bscsCount,
          ACT: actCount,
        },
        years: {
          year1: year1Count,
          year2: year2Count,
          year3: year3Count,
          year4: year4Count,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  //Get all admin accounts , used in Settings and AllOfficers.jsx
  getAll = async (req: any) => {
    try {
      const access = req.admin.access;

      const officers = await Admin.find({ status: account_status.ACTIVE });
      const users = officers.map((officer) => admin_model(officer));

      const data =
        access === psits_roles.HEAD_FINANCE || psits_roles.FINANCE
          ? users.filter(
              (user) =>
                user.access !== psits_roles.EXECUTIVE &&
                user.access !== psits_roles.ADMIN
            )
          : access === psits_roles.EXECUTIVE
            ? users.filter((user) => user.access !== psits_roles.ADMIN)
            : users;

      return data;
    } catch (error) {
      console.error("Error fetching officers:", error);
      throw error;
    }
  };
  //Get all members under admin
  getAllMembers = async () => {
    try {
      const rolesToFind = [
        student_roles.DEVELOPER,
        student_roles.OFFICER,
        student_roles.MEDIA,
        student_roles.VOLUNTEER,
      ];
      const members: IStudent[] = await Student.find({
        role: { $in: rolesToFind },
        isRequest: false,
      });
      const users = members.map((member) => role_model(member));

      return users;
    } catch (error) {
      console.error("Error fetching officers:", error);
      throw error;
    }
  };
  //Get all suspend admin account
  getAllSuspend = async () => {
    try {
      const officers = await Admin.find({ status: account_status.SUSPENDED });
      const users = officers.map((officer) => admin_model(officer));
      return users;
    } catch (error) {
      console.error("Error fetching officers:", error);
      throw error;
    }
  };
  //Edit Admin Account
  editAdmin = async (req: Request) => {
    const { id_number, name, position, email, course, year, campus } = req.body;
    try {
      const admin: IAdminDocument | null = await Admin.findOne({
        id_number: req.body.id_number,
      });
      if (!admin) {
        return { status: 404, message: "No Admin Found" };
      }

      const adminResult = await Admin.updateOne(
        { id_number: id_number },
        {
          $set: {
            name: name,
            position: position,
            campus: campus,
            email: email,
            course: course,
            year: year,
          },
        }
      );

      if (adminResult.modifiedCount > 0) {
        const params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.EDITED_ADMIN,
          target: `${id_number} - ${name}`,
          target_id: admin?._id,
          target_model: "Admin",
        };
        //Run Log
        await logService.create(params);

        return { status: true, message: "Officer updated successfully" };
      } else {
        return {
          status: false,
          error: "No officer found with the provided ID",
        };
      }
    } catch (error) {
      console.error("Error updating officer:", error);
      return { status: false, error: "Error in server" };
    }
  };
  //Change Admin Password
  changePassword = async (req: Request) => {
    try {
      const admin: IAdminDocument | null = await Admin.findOne({
        id_number: req.body.id_number,
      });

      if (!admin) {
        return { status: false, message: "Admin not found" };
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      admin.password = hashedPassword;
      await admin.save();

      const params = {
        admin: req.admin.name,
        admin_id: req.admin._id,
        action: logs_action.CHANGE_PASSWORD,
        target: `${admin.id_number} - ${admin.name}`,
        target_id: admin._id,
        target_model: "Admin",
      };
      //Runs Log
      await logService.create(params);

      return { status: true, message: "Password changed successfully" };
    } catch (error) {
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Suspend Specific Admin Account
  suspend = async (req: Request) => {
    const { id_number } = req.body;

    try {
      const updatedAdmin = await Admin.updateOne(
        { id_number },
        {
          $set: {
            status: account_status.SUSPENDED,
          },
        }
      );

      if (updatedAdmin.modifiedCount > 0) {
        const params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.SUSPEND,
          target: `${id_number}`,
          target_model: "Admin",
        };
        //Runs Log
        await logService.create(params);
        return { status: true, message: "Admin status updated to Suspend" };
      } else {
        return {
          status: false,
          message: "Admin not found or already suspended",
        };
      }
    } catch (error) {
      console.error("Error suspending admin:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Remove role of members
  removeRole = async (req: Request) => {
    const { id_number } = req.body;

    try {
      const updatedRole = await Student.updateOne(
        { id_number },
        {
          $set: {
            role: student_roles.GENERAL,
          },
        }
      );
      //Parameterized
      const first_params = {
        id_number,
        order_status: "Pending",
      };
      const second_params = {
        role: student_roles.GENERAL,
      };
      //Run Dynamic Update Query
      const updatedStudentOrder = await orderService.updateOneDynamic(
        first_params,
        second_params
      );
      //For logs
      const student: any = await studentService.getId(id_number);

      if (
        updatedRole.modifiedCount > 0 ||
        updatedStudentOrder.status === true
      ) {
        const params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.REMOVE_ROLE,
          target: `${id_number} `,
          target_id: student?._id,
          target_model: "Member",
        };
        //Runs Log
        await logService.create(params);
        return { status: true, message: "Role removed successfully" };
      } else {
        return { status: false, message: "Student not found" };
      }
    } catch (error) {
      console.error("Error removing role from admin:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Restore admin account
  restore = async (req: Request) => {
    const { id_number } = req.body;

    try {
      const admin: IAdminDocument | null = await Admin.findOne({
        id_number: req.body.id_number,
      });

      if (!admin) {
        return { status: 404, message: "No Admin Found!" };
      }

      const updatedAdmin = await Admin.updateOne(
        { id_number },
        {
          $set: {
            status: account_status.ACTIVE,
          },
        }
      );

      if (updatedAdmin.modifiedCount > 0) {
        // Log the restore officer action
        const params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.RESTORE,
          target: `${id_number} - ${admin?.name}`,
          target_id: admin?._id,
          target_model: "Admin",
        };
        //Runs Log
        await logService.create(params);

        return { status: 200, message: "Admin status updated to Active" };
      } else {
        return { status: 404, message: "Admin not found or already active" };
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  //Request role for member through admin
  requestRole = async (req: Request) => {
    const { id_number, role, admin } = req.body;

    try {
      //
      //Parametirized updated
      const params = {
        role: role,
        isRequest: true,
        adminRequest: admin,
      };
      //Run update
      const updatedRole = await studentService.updateOneDynamic(
        id_number,
        params
      );

      if (updatedRole.status === true) {
        //Parametirized Logs
        const log_params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.REQUEST_ROLE,
          target: role + " request",
          target_model: "Member",
        };
        //Runs Log
        await logService.create(log_params);
        return { status: true, message: "Role updated successfully" };
      } else {
        return { status: false, message: "Student not found" };
      }
    } catch (error) {
      console.error("Error updating student role:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Get all request member data who've in pending status
  getAllMemberRequest = async () => {
    try {
      const students: IStudent[] = await Student.find({ isRequest: true });
      const user = students.map((student) => role_model(student));
      return user;
    } catch (error) {
      console.error("Error fetching students:", error);
      return { status: false, message: "Internal Server Error" };
    }
  };
  //Get all admin request account creation
  getAllAdminRequest = async () => {
    try {
      const admin: IAdmin[] = await Admin.find({ status: "Request" });
      const users = admin.map((admins) => ({
        id_number: admins.id_number,
        email: admins.email,
        name: admins.name,
        course: admins.course,
        year: admins.year,
        role: admins.position,
        status: admins.status,
      }));
      return users;
    } catch (error) {
      console.error("Error fetching admins:", error);
      return { status: false, message: "Internal Server error" };
    }
  };
  //Approve Member Role as admin
  approveMember = async (req: Request) => {
    const { id_number } = req.body;

    try {
      const updatedRole = await studentService.updateOneDynamic(id_number, {
        isRequest: false,
      });

      if (updatedRole.status) {
        //Parametirized Logs
        const log_params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.APPROVE_ROLE,
          target: id_number,
          target_model: "Member",
        };
        //Runs Log
        await logService.create(log_params);
        return { status: true, message: "Role approved successfully" };
      } else {
        return { status: false, message: "Student not found" };
      }
    } catch (error) {
      console.error("Error updating student role:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Decline Member role as admin
  declineMember = async (req: Request) => {
    const { id_number } = req.body;

    try {
      const updatedRole = await studentService.updateOneDynamic(id_number, {
        role: student_roles.GENERAL,
        isRequest: false,
      });

      if (updatedRole.status) {
        //Parametirized Logs
        const log_params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.DECLINE_ROLE,
          target: id_number,
          target_model: "Member",
        };
        //Runs Log
        await logService.create(log_params);
        return { status: true, message: "Role declined successfully" };
      } else {
        return { status: false, message: "Student not found" };
      }
    } catch (error) {
      console.error("Error updating student role:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Create Admin Account
  create = async (req: Request) => {
    const {
      id_number,
      name,
      password,
      email,
      position,
      course,
      year,
      campus,
      status,
    } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin: IAdminDocument = new Admin({
        id_number,
        name,
        password: hashedPassword,
        email,
        position,
        course,
        year,
        campus,
        status: account_status.PENDING,
        access: psits_roles.STANDARD,
      });
      await newAdmin.save();

      const log_params = {
        admin: req.admin.name,
        admin_id: req.admin._id,
        action: logs_action.CREATE_ADMIN,
        target: id_number,
        target_model: "Admin",
      };
      //Runs Log
      await logService.create(log_params);

      return { status: true, message: "Account Creation successful" };
    } catch (error) {
      console.error(error);
      return { status: false, message: "Account Creation unsuccessful" };
    }
  };
  //Approved Admin Account
  approveAdmin = async (req: Request) => {
    const { id_number } = req.body;

    try {
      const updatedRole = await this.updateOneDynamic(id_number, {
        status: account_status.ACTIVE,
      });

      if (updatedRole.status) {
        const log_params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.APPROVE_ADMIN,
          target: id_number,
          target_model: "Admin",
        };
        //Runs Log
        await logService.create(log_params);
        return { status: true, message: "Admin Account approved successfully" };
      } else {
        return { status: false, message: "Admin not found" };
      }
    } catch (error) {
      console.error("Error updating admin account:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Decline Admin Account
  declineAdmin = async (req: Request) => {
    const { id_number } = req.body;

    try {
      const deletedAdmin = await Admin.deleteOne({ id_number });

      if (deletedAdmin.deletedCount > 0) {
        const log_params = {
          admin: req.admin.name,
          admin_id: req.admin._id,
          action: logs_action.DECLINE_ADMIN,
          target: id_number,
          target_model: "Admin",
        };
        //Runs Log
        await logService.create(log_params);
        return { status: true, message: "Admin account deleted successfully" };
      } else {
        return { status: false, message: "Admin not found" };
      }
    } catch (error) {
      console.error("Error deleting admin account:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
  //Change access in admin
  changeAccess = async (req: Request) => {
    const { id_number, newAccess } = req.body;

    if (!id_number || !newAccess) {
      return { status: false, message: "id_number and newAccess are required" };
    }

    try {
      const adminToUpdate: IAdminDocument | null = await Admin.findOne({
        id_number,
      });

      if (!adminToUpdate) {
        return { status: false, message: "Admin not found" };
      }

      adminToUpdate.access = newAccess;
      await adminToUpdate.save();

      const log_params = {
        admin: req.admin.name,
        admin_id: req.admin._id,
        action: logs_action.CHANGE_ACCESS,
        target: "Change Access to " + newAccess,
        target_model: "Admin",
      };
      //Runs Log
      await logService.create(log_params);

      return { status: false, message: "Access updated successfully" };
    } catch (error) {
      console.error("Error updating access account:", error);
      return { status: false, message: "An error occurred", error: error };
    }
  };
}

const adminService = new AdminService();

export { adminService };
