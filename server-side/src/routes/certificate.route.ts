import { Router } from "express";
import { 
  generateCertificate,
  getEligibleCertificatesForStudent 
} from "../controllers/certificate.controller";
import {
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  requireActiveStudentMembershipV2,
} from "../middlewares/authV2.middleware";

const router = Router();

// Get eligible certificates for authenticated student
router.get(
  "/eligible",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  requireActiveStudentMembershipV2,
  getEligibleCertificatesForStudent
);

// Generate certificate - requires student authentication
router.post(
  "/generate",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  requireActiveStudentMembershipV2,
  generateCertificate
);

export default router;
