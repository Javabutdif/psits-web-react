import { Router } from "express";
import multer from "multer";
import {
  addEligibleCertificates,
  removeEligibleCertificates,
  getEligibleCertificatesByEvent,
  bulkCheckEligibility,
  importEligibleCertificatesFromCSV,
} from "../controllers/eligibleCertificate.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";

const router = Router();

// Configure multer for CSV file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// Add eligible certificates
router.post(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  addEligibleCertificates
);

// Remove eligible certificates
router.delete(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  removeEligibleCertificates
);

// Get eligible certificates by event
router.get(
  "/event/:eventId",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getEligibleCertificatesByEvent
);

// Bulk check eligibility
router.post(
  "/bulk-check",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  bulkCheckEligibility
);

// Import from CSV
router.post(
  "/import-csv",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  upload.single("file"),
  importEligibleCertificatesFromCSV
);

export default router;
