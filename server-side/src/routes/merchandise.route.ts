import { Router, Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { merchandiseController } from "../controllers/merchandise.v2.controller";
import {
  retrieveReportController,
  deleteReportController,
} from "../controllers/merchandise.controller";
import dotenv from "dotenv";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
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
  if (!bucket) {
    return multer();
  }
  return multer({
    storage: multerS3({
      s3: r2Client,
      bucket: bucket,
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
};

//Create Merchandise Route
router.post(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  getUpload().array("images", 3),
  merchandiseController.create
);
//Retrieve All Active Merchandise
router.get(
  "/retrieve",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  merchandiseController.retrieveActive
);
router.get(
  "/retrieve-publish-merchandise",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  merchandiseController.retrievePublished
);
//Retrieve Specific Merchandise
router.get(
  "/retrieve/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  merchandiseController.retrieveById
);

router.get(
  "/retrieve-admin",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  merchandiseController.retrieveAll
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
  getUpload().array("images", 3),
  merchandiseController.update
);

// DELETE merch by id (soft)
router.put(
  "/delete-soft",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  merchandiseController.softDelete
);

// Publish merch
router.put(
  "/publish",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  merchandiseController.publish
);
router.get(
  "/reports",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  retrieveReportController
);

export default router;
