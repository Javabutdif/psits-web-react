import { Request, Response } from "express";
import { Types } from "mongoose";
import * as XLSX from "xlsx";
import { CertificateServiceV2 } from "../services/certificateV2.service";
import { PaginatedList } from "../custom_function/paginator";
import { Event } from "../models/event.model";

export const getAllActiveTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await CertificateServiceV2.getAllActiveTemplates();
    return res.status(200).json({ success: true, templates });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEventsWithCertificates = async (req: Request, res: Response) => {
  try {
    const events = await CertificateServiceV2.getAllEventsWithCertificates();
    return res.status(200).json({ success: true, events });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventAttendeesRaw = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const pageNumber = parseInt((req.query.pageNumber || req.query.page) as string, 10) || 1;
    const pageSize = parseInt((req.query.pageSize || req.query.limit) as string, 10) || 50;
    const search = ((req.query.search || req.query.searchQuery || "") as string).trim().toLowerCase();
    const sortBy = ((req.query.sortBy as string) || "").trim();
    const sortOrder = ((req.query.sortOrder as string) || "asc").trim().toLowerCase();

    let attendees = await CertificateServiceV2.getEventAttendeesRaw(eventId);

    if (search) {
      attendees = attendees.filter(
        (a: any) =>
          a.name?.toLowerCase().includes(search) ||
          a.id_number?.toLowerCase().includes(search)
      );
    }

    if (sortBy) {
      let eligibleSet = new Set<string>();
      if (sortBy === "status" && Types.ObjectId.isValid(eventId)) {
        const objectId = new Types.ObjectId(eventId);
        const eventQuery = { $or: [{ _id: objectId }, { eventId: objectId }] };
        const event = await Event.findOne(eventQuery).select("eligibleStudentsForCertificate").lean();
        if (event && Array.isArray(event.eligibleStudentsForCertificate)) {
          eligibleSet = new Set(event.eligibleStudentsForCertificate);
        }
      }

      attendees.sort((a: any, b: any) => {
        let aVal: any = "";
        let bVal: any = "";

        if (sortBy === "id_number") {
          aVal = a.id_number || "";
          bVal = b.id_number || "";
        } else if (sortBy === "name") {
          aVal = a.name || "";
          bVal = b.name || "";
        } else if (sortBy === "course") {
          aVal = `${a.course || ""} - ${a.year_level || ""}`;
          bVal = `${b.course || ""} - ${b.year_level || ""}`;
        } else if (sortBy === "status") {
          aVal = eligibleSet.has(a.id_number) ? 1 : 0;
          bVal = eligibleSet.has(b.id_number) ? 1 : 0;
        }

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    const paginatedResult = PaginatedList.create(attendees, pageNumber, pageSize);

    return res.status(200).json({ success: true, data: paginatedResult });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCertificateTemplate = async (req: Request, res: Response) => {
  try {
    const template = await CertificateServiceV2.createCertificateTemplate(req.body);
    return res.status(201).json({ success: true, template });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCertificateTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = req.params.templateId as string;
    const template = await CertificateServiceV2.updateCertificateTemplate(templateId, req.body);
    return res.status(200).json({ success: true, template });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const configureEventCertificate = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const { templateId, isGenerateCertificate } = req.body;
    const event = await CertificateServiceV2.configureEventCertificate(
      eventId,
      templateId,
      isGenerateCertificate
    );
    return res.status(200).json({ success: true, event });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const processCsvOrXlsxEligibility = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;

    let studentIds: string[] = [];

    // If a file was uploaded (e.g. via multer middleware)
    if (req.file && req.file.buffer) {
      const mimeType = req.file.mimetype;
      const originalName = req.file.originalname.toLowerCase();

      // Check if it's an Excel (.xlsx/.xls) file
      if (
        mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimeType === "application/vnd.ms-excel" ||
        originalName.endsWith(".xlsx") ||
        originalName.endsWith(".xls")
      ) {
        // Read the binary workbook from buffer
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        
        // Grab the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to raw 2D array of rows
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Map the first column, filter headers/empties
        studentIds = rows
          .map((row) => String(row[0] || "").trim())
          .filter((id) => id && id.toLowerCase() !== "student id");
      } else {
        const csvString = req.file.buffer.toString("utf8");
        // Split by new line, grab the first column
        studentIds = csvString
          .split(/\r?\n/)
          .map((line) => line.trim().split(",")[0])
          .filter((id) => id && id.toLowerCase() !== "student id"); // filter out empty lines and header
      }
    } else if (req.body.csvStudentIds && Array.isArray(req.body.csvStudentIds)) {
      // Fallback: if they just sent a JSON array
      studentIds = req.body.csvStudentIds;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No CSV/Excel file or csvStudentIds array provided." });
    }

    const results = await CertificateServiceV2.processCsvEligibility(eventId, studentIds);
    return res.status(200).json({ success: true, results });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudentEligibility = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const { studentIds, isEligible } = req.body;

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: "studentIds must be an array" });
    }

    const updatedList = await CertificateServiceV2.updateStudentEligibility(
      eventId,
      studentIds,
      isEligible
    );
    return res.status(200).json({ success: true, eligibleStudentsForCertificate: updatedList });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateStudentCertificate = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const studentId = req.params.studentId as string;

    const { pdfBuffer, fileName } = await CertificateServiceV2.verifyAndGenerateStudentCertificate(
      eventId,
      studentId
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send(pdfBuffer);
  } catch (error: any) {
    // NOTE: Here is where you can catch rate limiter errors if implemented in middleware
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const previewTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = req.params.templateId as string;

    const { pdfBuffer, fileName } = await CertificateServiceV2.previewTemplate(templateId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`); // inline so browser can display it
    return res.status(200).send(Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetFileTree = async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter || req.query.type || "") as string;
    const tree = await CertificateServiceV2.getAssetFileTree(filter.trim().toLowerCase());
    return res.status(200).json({ success: true, data: tree });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

