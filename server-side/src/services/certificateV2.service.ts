import { Event } from "../models/event.model";
import { CertificateTemplate } from "../models/certificateTemplate.model";
import { ICertificateTemplate } from "../models/certificateTemplate.interface";
import { Student } from "../models/student.model";
import { generatePDFFromEJS } from "../mail_template/utils/generate-pdf-from-ejs";
import { CertificateDataSchema } from "../mail_template/mail.schema";
import { Types } from "mongoose";
import fs from "fs";
import path from "path";

export interface AssetTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  extension?: string;
  children?: AssetTreeNode[];
}

export class CertificateServiceV2 {
  // 1. getAllActiveTemplates
  static async getAllActiveTemplates() {
    return await CertificateTemplate.find({ isActive: true });
  }

  // 1.5 getAllEventsWithCertificates
  static async getAllEventsWithCertificates() {
    return await Event.find({ isGenerateCertificate: true }).populate("certificateTemplate");
  }

  // 1.5.5 getStudentCertificateEvents
  static async getStudentCertificateEvents(studentId: string) {
    const events = await Event.find({ isGenerateCertificate: true })
      .populate("certificateTemplate")
      .lean();

    const eligibleList: any[] = [];
    const otherList: any[] = [];

    for (const event of events) {
      const isEligible = Array.isArray(event.eligibleStudentsForCertificate) &&
        event.eligibleStudentsForCertificate.includes(studentId);

      const mappedEvent = {
        _id: event._id,
        eventId: event.eventId,
        eventName: event.eventName,
        eventDate: event.eventDate,
        eventImage: event.eventImage,
        eventDescription: event.eventDescription,
        eventTheme: (event.certificateTemplate as any)?.description || "",
        location: "TBA",
        isEligible: isEligible,
      };

      if (isEligible) {
        eligibleList.push(mappedEvent);
      } else {
        otherList.push(mappedEvent);
      }
    }

    return {
      eligible: eligibleList,
      other: otherList,
    };
  }

  // 1.6 getEventAttendeesRaw (bypasses campus filter for cert management)
  static async getEventAttendeesRaw(eventId: string) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event ID format");
    }
    const objectId = new Types.ObjectId(eventId);
    const query = { $or: [{ _id: objectId }, { eventId: objectId }] };
    
    const event = await Event.findOne(query).select("attendees").lean();
    if (!event) throw new Error("Event not found");

    const attendees = Array.isArray(event.attendees) ? event.attendees : [];
    
    return attendees.map((attendee: any) => ({
      name: attendee.name,
      id_number: attendee.id_number,
      campus: attendee.campus,
      course: attendee.course,
      year_level: attendee.year,
    }));
  }

  // 2. createCertificateTemplate
  static async createCertificateTemplate(data: ICertificateTemplate) {
    const template = new CertificateTemplate({
      ...data,
      isActive: true, // Default to true
    });
    return await template.save();
  }

  // 2.5 updateCertificateTemplate
  static async updateCertificateTemplate(templateId: string, data: Partial<ICertificateTemplate>) {
    const template = await CertificateTemplate.findByIdAndUpdate(
      templateId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!template) throw new Error("Template not found");
    return template;
  }

  // 3. configureEventCertificate
  static async configureEventCertificate(
    eventId: string,
    templateId: string,
    isGenerateCertificate: boolean
  ) {
    const event = await Event.findOneAndUpdate(
      { eventId },
      {
        certificateTemplate: new Types.ObjectId(templateId),
        isGenerateCertificate,
      },
      { new: true }
    );
    if (!event) throw new Error("Event not found");
    return event;
  }

  // 4. processCsvEligibility
  static async processCsvEligibility(eventId: string, csvStudentIds: string[]) {
    const { Types } = require("mongoose");
    const objectId = Types.ObjectId.isValid(eventId) ? new Types.ObjectId(eventId) : null;
    const query = objectId ? { $or: [{ _id: objectId }, { eventId: objectId }] } : { eventId };

    const event = await Event.findOne(query);
    if (!event) throw new Error("Event not found");

    const attendees = Array.isArray(event.attendees) ? event.attendees : [];

    const results = csvStudentIds.map((id) => {
      const attendee = attendees.find((a: any) => a.id_number === id);
      return {
        studentId: id,
        name: attendee ? attendee.name : "Unknown Student",
        isAttendee: !!attendee,
        status: attendee ? "valid" : "missing",
      };
    });

    return results;
  }

  // 5. updateStudentEligibility
  static async updateStudentEligibility(
    eventId: string,
    studentIds: string[],
    isEligible: boolean
  ) {
    const updateQuery = isEligible
      ? { $addToSet: { eligibleStudentsForCertificate: { $each: studentIds } } }
      : { $pullAll: { eligibleStudentsForCertificate: studentIds } };

    const event = await Event.findOneAndUpdate({ eventId }, updateQuery, {
      new: true,
    });
    if (!event) throw new Error("Event not found");
    return event.eligibleStudentsForCertificate;
  }

  // 6. verifyStudentEligibility & generate PDF
  static async verifyAndGenerateStudentCertificate(
    eventId: string,
    studentId: string
  ) {
    const event = await Event.findOne({ eventId }).populate("certificateTemplate");
    if (!event) throw new Error("Event not found");
    if (!event.isGenerateCertificate)
      throw new Error("Certificate generation is not enabled for this event");

    if (!event.eligibleStudentsForCertificate?.includes(studentId)) {
      throw new Error("Student is not eligible for this certificate");
    }

    const template = event.certificateTemplate as any;
    if (!template || !template.ejsRelativePath) {
      throw new Error("Invalid certificate template configuration");
    }

    const student = await Student.findOne({ id_number: studentId });
    if (!student) throw new Error("Student not found");

    // Map to TCertificateData (Fallback data might be needed depending on your Event Schema fields)
    const certData = {
      student_name: `${student.first_name} ${student.last_name}`,
      event_name: event.eventName,
      event_date: event.eventDate
        ? new Date(event.eventDate).toLocaleDateString()
        : "TBA",
      event_start_time: "TBA",
      event_end_time: "TBA",
      event_venue_specific: "TBA",
      event_venue: "TBA",
      event_theme: "",
      signees: template.defaultSignees || [],
      images: template.defaultImages
        ? Object.fromEntries(template.defaultImages)
        : {},
      fonts: template.defaultFonts
        ? Object.fromEntries(template.defaultFonts)
        : {},
    };

    const parsedData = CertificateDataSchema.parse(certData);
    const pdfBuffer = await generatePDFFromEJS(
      template.ejsRelativePath,
      parsedData
    );

    return {
      pdfBuffer,
      fileName: `${parsedData.student_name}-CERT.pdf`.toUpperCase(),
    };
  }

  // 7. previewTemplate (Generate dummy PDF for preview)
  static async previewTemplate(templateId: string) {
    const template = await CertificateTemplate.findById(templateId);
    if (!template || !template.ejsRelativePath) {
      throw new Error("Invalid or missing certificate template configuration");
    }

    const dummyCertData = {
      student_name: "John Doe",
      event_name: "Sample Awesome Event 2026",
      event_theme: "Technology for the Future",
      event_date: new Date().toLocaleDateString(),
      event_start_time: "08:00 AM",
      event_end_time: "05:00 PM",
      event_venue_specific: "Main Auditorium",
      event_venue: "City Convention Center",
      signees: template.defaultSignees || [],
      images: template.defaultImages ? Object.fromEntries(template.defaultImages as any) : {},
      fonts: template.defaultFonts ? Object.fromEntries(template.defaultFonts as any) : {},
    };

    const parsedData = CertificateDataSchema.parse(dummyCertData);
    const pdfBuffer = await generatePDFFromEJS(template.ejsRelativePath, parsedData);

    return {
      pdfBuffer,
      fileName: `PREVIEW-CERT.pdf`,
    };
  }

  // 10. getAssetFileTree
  static async getAssetFileTree(filterType?: string): Promise<AssetTreeNode[]> {
    let assetsDir = path.resolve(__dirname, "../assets");
    if (!fs.existsSync(assetsDir)) {
      assetsDir = path.resolve(__dirname, "../../assets");
    }
    if (!fs.existsSync(assetsDir)) {
      return [];
    }

    const validExtensions: Record<string, string[]> = {
      image: [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"],
      font: [".ttf", ".woff", ".woff2", ".otf", ".eot"],
      ejs: [".ejs"],
    };

    const allowedExts =
      filterType && validExtensions[filterType]
        ? validExtensions[filterType]
        : null;

    const traverse = (dirPath: string, relPath: string): AssetTreeNode[] => {
      let entries;
      try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
      } catch (e) {
        return [];
      }

      const nodes: AssetTreeNode[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const nodeRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          const children = traverse(fullPath, nodeRelPath);
          if (!allowedExts || children.length > 0) {
            nodes.push({
              name: entry.name,
              path: nodeRelPath.replace(/\\/g, "/"),
              type: "directory",
              children,
            });
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!allowedExts || allowedExts.includes(ext)) {
            nodes.push({
              name: entry.name,
              path: nodeRelPath.replace(/\\/g, "/"),
              type: "file",
              extension: ext,
            });
          }
        }
      }

      nodes.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === "directory" ? -1 : 1;
      });

      return nodes;
    };

    return traverse(assetsDir, "");
  }
}
