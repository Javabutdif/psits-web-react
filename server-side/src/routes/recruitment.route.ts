import { Router, Request } from "express";
import { recruitmentController } from "../controllers/recruitment.v2.controller";
import { requireAccessTokenV2, roleAuthenticateV2 } from "../middlewares/authV2.middleware";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const router = Router();

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const getUpload = () => {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) return multer();

  return multer({
    storage: multerS3({
      s3: r2Client,
      bucket,
      metadata: (
        req: any,
        file: Express.Multer.File,
        cb: (error: any, metadata?: any) => void
      ) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (
        req: any,
        file: Express.Multer.File,
        cb: (error: any, key?: string) => void
      ) => {
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop() || 'pdf';
        cb(null, `recruitment/${timestamp}_${file.fieldname}.${extension}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
    },
    fileFilter: (req, file, cb) => {
      // Only allow PDF files
      if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed."));
      }
    }
  });
};

/** Public: List all positions */
router.get(
  "/positions",
  recruitmentController.listPositions
);

/** Public: Get single position by ID */
router.get(
  "/positions/:id",
  recruitmentController.getPositionById
);

/** Admin: Create a new position */
router.post(
  "/positions",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.createPosition
);

/** Admin: Update a position */
router.patch(
  "/positions/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.updatePosition
);

/** Admin: Toggle hiring status */
router.patch(
  "/positions/:id/status",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.toggleHiringStatus
);

/** Admin: Delete/archive position */
router.delete(
  "/positions/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  recruitmentController.deletePosition
);

router.post(
  "/positions/:id/applications",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  getUpload().fields([
    { name: "resume", maxCount: 1 },
    { name: "applicationLetter", maxCount: 1 }
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
