import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Student } from "../models/student.model";
import { Admin } from "../models/admin.model";
import { Merch } from "../models/merch.model";
import { Orders } from "../models/orders.model";
import { Log } from "../models/log.model";
import { Settings } from "../models/settings.model";
import { MembershipHistory } from "../models/history.model";
import { format, startOfDay, endOfDay } from "date-fns";
import { admin_model, role_model } from "../model_template/model_data";
import { membershipRequestReceipt } from "../mail_template/mail.template";
import { IMembershipRequest } from "../mail_template/mail.interface";
import { IStudent } from "../models/student.interface";
import { IHistory } from "../models/history.interface";
import { IOrders } from "../models/orders.interface";
import { IAdmin, IAdminDocument } from "../models/admin.interface";
import { user_model } from "../model_template/model_data";
import { account_status, membership_status } from "../enums/status.enums";
import { student_roles } from "../enums/role.enums";
import { campus_type } from "../enums/campus.enums";
import { stripTypeScriptTypes } from "module";

class StudentService {
  //Function Format
  //Full Name format
  fullNameFormat(student: IStudent) {
    return (
      student.first_name + " " + student.middle_name + " " + student.last_name
    );
  }
  //Word Format
  capitalizeFormat(word: String) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  //
  //
  //Services
  //get search specific student with params
  getSpecific = async (params: any) => {
    try {
      const student = await Student.findOne({ params });

      return student;
    } catch (error) {
      console.error("No student found");
      throw error;
    }
  };
  //get search student with session
  getIdSession = async (id_number: String, session: any) => {
    return await Student.findOne({ id_number }).session(session);
  };
  //Fetch all students
  getAll = async () => {
    try {
      const student: IStudent[] = await Student.find();

      return student;
    } catch (error) {
      console.error("No student found");
    }
  };
  //Update Student with Dynamic Query
  updateOneDynamic = async (id_number: String, parameters: any) => {
    try {
      const result = await Student.updateOne(
        { id_number },
        { $set: parameters }
      );

      if (result.matchedCount === 0) {
        return { status: false, message: "Student not found" };
      }

      if (result.modifiedCount === 0) {
        return { status: true, message: "No changes made" };
      }

      return { status: true, message: "Student updated successfully" };
    } catch (error) {
      return { status: false, message: "Error updating student", error };
    }
  };

  //Register | Create student
  create = async (req: Request) => {
    const {
      id_number,
      password,
      first_name,
      middle_name,
      last_name,
      email,
      course,
      year,
    } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newStudent = new Student({
        id_number,
        rfid: "N/A",
        password: hashedPassword,
        first_name: this.capitalizeFormat(first_name),
        middle_name:
          middle_name === undefined ? "" : this.capitalizeFormat(middle_name),
        last_name: this.capitalizeFormat(last_name),
        email,
        course,
        year,
        status: account_status.ACTIVE,
        membershipStatus: membership_status.NONE,
        applied: new Date(),
        role: student_roles.GENERAL,
        campus: campus_type.MAIN,
        isRequest: false,
        isYearUpdated: true,
      });
      await newStudent.save();

      return { status: true, message: "Registration successful" };
    } catch (error) {
      if (error) {
        return { status: false, message: "Id number already exists" };
      } else {
        console.error({ message: "Error saving new student:", error });
        return { status: false, message: "Internal Server Error" };
      }
    }
  };
  //Count on how many students, request and deleted, this will be under membership tab
  count = async () => {
    try {
      const [all, request, deleted] = await Promise.all([
        Student.countDocuments({
          status: account_status.ACTIVE,
        }),
        Student.countDocuments({ membershipStatus: membership_status.PENDING }),

        Student.countDocuments({ status: account_status.ACTIVE }),
      ]);

      return { all, request, deleted };
    } catch (error) {
      console.error(error);
      return { all: 0, request: 0, deleted: 0 };
    }
  };
}

const studentService = new StudentService();

export { studentService };
