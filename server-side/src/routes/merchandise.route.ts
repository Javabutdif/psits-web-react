import { Router, Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import {
  createMerchandiseController,
  retrieveActiveMerchandiseController,
  retrieveSpecificMerchandiseController,
  retrieveMerchAdminController,
  deleteReportController,
  updateMerchandiseController,
  softDeleteMerchandiseController,
  publishMerchandiseController,
  retrieveActiveAndPublishMerchandiseController,
  retrieveReportController,
} from "../controllers/merchandise.controller";
import dotenv from "dotenv";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
const router = Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME!,
    metadata: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: any, metadata?: any) => void
    ) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: any, key?: string) => void
    ) => {
      cb(null, `merchandise/${Date.now()}_${file.originalname}`);
    },
  }),
});

//Create Merchandise Route
router.post(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  upload.array("images", 3),
  createMerchandiseController
);
//Retrieve All Active Merchandise
router.get(
  "/retrieve",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  retrieveActiveMerchandiseController
);
router.get(
  "/retrieve-publish-merchandise",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  retrieveActiveAndPublishMerchandiseController
);
//Retrieve Specific Merchandise
router.get(
  "/retrieve/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  retrieveSpecificMerchandiseController
);

router.get(
  "/retrieve-admin",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  retrieveMerchAdminController
);
//Delete Report in Merchandise
router.delete(
  "/delete-report",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  deleteReportController
);
//Update Merchandise Data
router.put(
  "/update/:_id",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  upload.array("images", 3),
  updateMerchandiseController
);

// DELETE merch by id (soft)
router.put(
  "/delete-soft",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  softDeleteMerchandiseController
);

// Publish merch
router.put(
  "/publish",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  publishMerchandiseController
);
router.get(
  "/reports",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  retrieveReportController
);

export default router;
