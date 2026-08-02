import { Request, Response } from "express";
import { IStudent } from "../models/student.interface";
import { Student } from "../models/student.model";
import { user_model } from "../model_template/model_data";
import { orderService } from "../services/order.service";
import { Refund } from "../models/refund.model";
import { Settings } from "../models/settings.model";
import { membership_status } from "../enums/status.enums";
import { normalizeMembershipStatus } from "../util/membership.util";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findStudentByLookupId = async (rawIdNumber: string) => {
  const normalized = rawIdNumber.trim();
  const baseIdNumber = normalized.split("-")[0]?.trim() ?? "";

  let student = await Student.findOne({ id_number: normalized });

  if (!student && baseIdNumber) {
    student = await Student.findOne({
      id_number: new RegExp(`^${escapeRegex(baseIdNumber)}(?:-.*)?$`),
    });
  }

  return student;
};

export const getStudentProfile = async(req: Request, res: Response)=>{
  try{
    const {id_number} = req.params;
    const profile: IStudent | null = await Student.findOne({id_number})
    .select('id_number first_name middle_name last_name course year email campus -_id');;
    if(!profile){
      return res.status(404).json({message: "Profile Not Found!"});
    }
    return res.status(200).json({ data: profile });
  }catch(error){
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ message: 'Server error' });  
  }
}

export const getStudentLookupForAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const id_number = req.params.id_number as string;

    if (!id_number?.trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student: IStudent | null = await findStudentByLookupId(id_number);

    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }

    return res.status(200).json({ data: user_model(student) });
  } catch (error) {
    console.error("Error fetching student lookup:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentMembershipStatusV2 = async (
  req: Request,
  res: Response
) => {
  try {
    const student = await Student.findById(req.userV2.sub).select(
      "id_number membershipStatus isFirstApplication"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const settings = await Settings.findOne().select("membership_price").lean();
    const rawStatus = student.membershipStatus;

    return res.status(200).json({
      status: normalizeMembershipStatus(rawStatus),
      rawStatus,
      isFirstApplication: student.isFirstApplication,
      membershipPrice: settings?.membership_price ?? 0,
    });
  } catch (error) {
    console.error("Error fetching student membership status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const requestStudentMembershipV2 = async (
  req: Request,
  res: Response
) => {
  try {
    const student = await Student.findById(req.userV2.sub).select(
      "membershipStatus isFirstApplication"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const status = normalizeMembershipStatus(student.membershipStatus);

    if (status === "active") {
      return res.status(400).json({ message: "Membership is already active." });
    }

    if (status === "pending") {
      return res
        .status(400)
        .json({ message: "You already have a pending membership request." });
    }

    await Student.updateOne(
      { _id: student._id },
      { $set: { membershipStatus: membership_status.PENDING } }
    );

    return res.status(200).json({
      message: "Membership request submitted successfully.",
      status: "pending",
      rawStatus: membership_status.PENDING,
      isFirstApplication: student.isFirstApplication,
    });
  } catch (error) {
    console.error("Error submitting membership request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentOrders = async (req: Request, res: Response) => {
  try {
    const { idNumber } = req.userV2;
    const result = await orderService.getAllOrdersDynamicStatus({
      query: req.query,
      status: (req.query.status as string) || "Pending",
    });

    const studentOrders = (result.data as any[]).filter(
      (o) => o.id_number === idNumber
    );

    return res.status(200).json({
      message: "Successfully retrieved student orders",
      data: studentOrders,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Error fetching student orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getStudentRefund = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const refunds = await Refund.find({ order_id: orderId });
    return res.status(200).json({ data: refunds });
  } catch (error) {
    console.error("Error fetching refund details:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
