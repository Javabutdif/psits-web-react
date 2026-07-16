import { Report } from "../models/report.model";
import mongoose, { Types, ClientSession } from "mongoose";
import { AppError } from "../util/app.error.util";

class ReportService {
  //Create Report
  createReport = async (reportData: {
    order_id: Types.ObjectId;
    student_id: string;
    merch_id: Types.ObjectId;
    item_count: number;
    total: number;
  }) => {
    const report = await Report.create(reportData);

    return report;
  };
  //Create report for multiple items
  createReports = async (
    reportDataArray: {
      order_id: Types.ObjectId;
      student_id: string;
      merch_id: Types.ObjectId;
      item_count: number;
      total: number;
    }[],
    session?: ClientSession
  ) => {
    const reports = await Report.insertMany(reportDataArray, { session });
    return {
      success: true,
      count: reports.length,
    };
  };
  // Get merchandise sales summary
  getSalesSummary = async () => {
    const result = await Report.aggregate([
      {
        $group: {
          _id: "$merch_id",
          total_items_sold: {
            $sum: "$item_count",
          },
          total_sales: {
            $sum: "$total",
          },
        },
      },
      {
        $lookup: {
          from: "merches",
          localField: "_id",
          foreignField: "_id",
          as: "merch",
        },
      },
      {
        $unwind: "$merch",
      },
      {
        $sort: {
          "merch.name": 1,
        },
      },
      {
        $project: {
          _id: 0,
          merch_id: "$_id",
          merch_name: "$merch.name",
          total_items_sold: 1,
          total_sales: 1,
        },
      },
    ]);

    return result;
  };
  // Get reports with pagination
  getReports = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const reports = await Report.find()
      .populate("merch_id")
      .sort({
        date: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments();

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };
}

export const reportService = new ReportService();
