import { reportService } from "../services/report.service";
import { catchAsync } from "../util/catch.async.util";
import { Request, Response } from "express";

class ReportController {
  fetchReport = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const result = await reportService.getMerchandiseReport({
      page,
      limit,
      search: req.query.search as string,
      referenceCode: req.query.referenceCode as string,
      studentId: req.query.studentId as string,
      name: req.query.name as string,
      course: req.query.course as string,
      year: req.query.year as string,
      productName: req.query.productName as string,
      size: req.query.size as string,
      color: req.query.color as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    });
    return res.status(200).json({
      message: "Successfully retrieved merchandise reports",
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      summary: result.summary,
      productNames: result.productNames,
    });
  });
}

export const reportController = new ReportController();
