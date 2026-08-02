import { Router } from "express";
import multer from "multer";
import {
  getAllActiveTemplates,
  getAllEventsWithCertificates,
  createCertificateTemplate,
  updateCertificateTemplate,
  configureEventCertificate,
  processCsvOrXlsxEligibility,
  updateStudentEligibility,
  generateStudentCertificate,
  previewTemplate,
  getEventAttendeesRaw,
  getAssetFileTree,
  getStudentCertificateEvents,
} from "../controllers/certificateV2.controller";
import {
  requireAccessTokenV2,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";

const upload = multer({ storage: multer.memoryStorage() });
const router: Router = Router();

// =======================
// Admin & Dev Routes
// =======================

// Get asset files tree
router.get(
  "/assets-tree",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAssetFileTree
);

// Get all active templates
router.get(
  "/templates",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllActiveTemplates
);

// Get all events with certificates
router.get(
  "/events",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllEventsWithCertificates
);

// Create a new template (typically Dev/Admin only)
router.post(
  "/templates",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  createCertificateTemplate
);

// Update an existing template
router.patch(
  "/templates/:templateId",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  updateCertificateTemplate
);

// Preview a template
router.get(
  "/templates/:templateId/preview",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  previewTemplate
);

// Get all attendees for a specific event raw (bypasses campus filter)
router.get(
  "/:eventId/attendees-raw",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getEventAttendeesRaw
);

// Configure an event to enable certificates and assign a template
router.patch(
  "/:eventId/configure",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  configureEventCertificate
);

// Upload a CSV to cross-reference attendees for eligibility
router.post(
  "/:eventId/eligibility/csv",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  upload.single("file"),
  processCsvOrXlsxEligibility
);

// Mass update student eligibility (add/remove from eligible list)
router.patch(
  "/:eventId/eligibility",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  updateStudentEligibility
);


// =======================
// Student Routes
// =======================

// Get student eligible and other certificate events
router.get(
  "/student/events",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  getStudentCertificateEvents
);

// Generate and download a certificate (PDF)
router.get(
  "/:eventId/generate/:studentId",
  requireAccessTokenV2,
  roleAuthenticateV2(["student", "admin"]),
  generateStudentCertificate
);

export default router;
