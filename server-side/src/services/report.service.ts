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
}

export const reportService = new ReportService();
