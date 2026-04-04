import jwt from "jsonwebtoken";
import { account_status, membership_status } from "../enums/status.enums";
import { student_roles, general_roles } from "../enums/role.enums";
import { campus_type } from "../enums/campus.enums";
import bcrypt from "bcryptjs";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";
import { IAdminDocument } from "../models/admin.interface";
import { Log } from "../models/log.model";
import { forgotPasswordMail } from "../mail_template/mail.template";
import { Request, Response } from "express";
import { IStudent } from "../models/student.interface";
import dotenv from "dotenv";
dotenv.config();
const token_key = process.env.JWT_SECRET ?? "Default_Token";

const url =
  process.env.DB_NAME !== "psits-test"
    ? "https://psits.vercel.app/reset-password/"
    : "https://psits-staging.vercel.app/reset-password/";

import { studentService } from "../services/student.service";
import { adminService } from "../services/admin.service";
import { indexService } from "../services/index.service";
import { logService } from "../services/log.service";

export const loginController = async (req: Request, res: Response) => {
  const { id_number, password } = req.body;

  try {
    let users: any;
    let role;
    let admin: IAdminDocument | null = null;
    let student: IStudent | null = null;
    let campus;

    if (id_number.includes("-admin")) {
      admin = await adminService.access(id_number);
    }

    if (!admin) {
      student = await studentService.getSpecific(id_number);
      if (!student) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const result: any = await indexService.checkValidation(
        general_roles.STUDENT,
        password,
        student
      );

      if (!result.status) {
        res.status(404).json({ message: result.message });
      } else {
        users = result.users;
        role = result.role;
      }
    } else {
      const result: any = await indexService.checkValidation(
        general_roles.ADMIN,
        password,
        admin
      );

      if (!result.status) {
        res.status(404).json({ message: result.message });
      } else {
        users = result.users;
        role = result.role;
      }
    }

    const user = {
      id_number: users.id_number,
    };
    campus = users.campus;
    const token = jwt.sign({ user }, token_key, {
      expiresIn: role === general_roles.ADMIN ? "4h" : "10m",
    });

    if (admin) {
      if (role === general_roles.ADMIN) {
        const params = {
          admin: admin.name,
          admin_id: admin._id,
          action: "Admin Login",
        };
        //Runs logs
        await logService.create(params);
      }
    }
    console.log({ role, token, campus });
    return res.status(200).json({
      message: "Signed in successfully",
      role,
      token,
      campus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error });
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const result = await studentService.create(req);
    if (!result.status) {
      res.status(400).json({ message: result.message });
    } else {
      res.status(200).json({ message: result.message });
    }
  } catch (error) {
    res.status(400).json({ message: "Internal server error" });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    let user;
    let position;

    // Find the user by email
    const userAdmin = await Admin.findOne({
      email: req.body.email,
      id_number: req.body.id_number,
    });
    const getUser = await Student.findOne({
      email: req.body.email,
      id_number: req.body.id_number,
    });

    if (userAdmin) {
      user = userAdmin;
    } else if (getUser) {
      user = getUser;
    } else if (!getUser) {
      console.error(`User with email ${req.body.email} not found`);
      return res.status(404).json({
        message: `The id number you entered is found but appears to be the email is incorrect.`,
      });
    } else if (!userAdmin) {
      console.error(
        `The id number you entered is found but appears to be the email is incorrect.`
      );
      return res.status(404).json({
        message: `The id number you entered is found but appears to be the email is incorrect.`,
      });
    } else {
      console.error(`User with email ${req.body.email} not found`);
      return res.status(404).json({
        message: `The id number you entered is found but appears to be the email is incorrect.`,
      });
    }

    const token = jwt.sign({ userId: user._id }, token_key, {
      expiresIn: "10m",
    });

    await forgotPasswordMail(req.body.email, url, token);

    res.status(200).json({
      message:
        "Email sent successfully! Please check your email for further instructions.",
    });
  } catch (err) {
    console.error("Server error during forgot password process:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export interface jwtPayload {
  userId: string;
}

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const decodedToken = jwt.verify(req.params.token, token_key) as jwtPayload;

    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }
    let user;

    const getStudent = await Student.findOne({ _id: decodedToken.userId });
    const getAdmin = await Admin.findOne({ _id: decodedToken.userId });
    if (getStudent) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

      // Update user's password, clear reset token and expiration time
      getStudent.password = req.body.newPassword;
      await getStudent.save();
    } else if (getAdmin) {
      const salt = await bcrypt.genSalt(10);
      req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

      // Update user's password, clear reset token and expiration time
      getAdmin.password = req.body.newPassword;
      await getAdmin.save();
    } else {
      return res.status(401).send({ message: "no user found" });
    }

    // Send success response
    res.status(200).send({ message: "Password updated" });
  } catch (err) {
    // Send error response if any error occurs
    console.error("Server error during reset password process:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
