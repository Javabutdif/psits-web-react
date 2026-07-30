import { Router } from "express";
import { recruitmentController } from "../controllers/recruitment.v2.controller";
import {
  requireAccessTokenV2,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";
import multer from "multer";
import path from "path";

const router = Router();

/** Public endpoints - no auth required for reading positions */
router.get("/positions", recruitmentController.listPositions);

router.get("/positions/:id", recruitmentController.getPositionById);

/** Admin-only endpoints - require role authentication */
router.post(
  "/positions",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.createPosition
);

router.patch(
  "/positions/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.updatePosition
);

router.delete(
  "/positions/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.deletePosition
);

router.patch(
  "/positions/:id/hiring-status",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.toggleHiringStatus
);

/** Student endpoints - applications submission and retrieval */
// Note: POST requires multer middleware for multipart form data
const upload = multer({
  dest: "tmp/uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (
      file.mimetype === "application/pdf" ||
      path.extname(file.originalname).toLowerCase() === ".pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

router.post(
  "/positions/:id/applications",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  upload.fields([
    { name: "resume", maxCount: 1 },

    // NOTE:
    // Application letter upload is temporarily disabled because the current
    // recruitment form only requires a resume. Uncomment the code below
    // when the application letter feature is reintroduced.

    //{ name: "applicationLetter", maxCount: 1 }
  ]),
  recruitmentController.submitApplication
);

router.get(
  "/applications/me",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  recruitmentController.getApplicationsForUser
);

router.get(
  "/applications/me/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  recruitmentController.getApplicationForUser
);

/** Admin endpoints - applicant management */
router.get(
  "/applicants",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.getApplicants
);

router.get(
  "/applications/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.getApplicationDetails
);

router.patch(
  "/applications/:id/status",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.updateApplicationStatus
);

router.post(
  "/applications/:id/interview",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.createInterview
);

router.patch(
  "/applications/:id/interview",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.updateInterview
);

router.delete(
  "/applications/:id/interview",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.cancelInterview
);

export default router;
