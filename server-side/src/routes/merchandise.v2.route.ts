import { Router, Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { merchandiseController } from "../controllers/merchandise.v2.controller";
import dotenv from "dotenv";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
import { psits_roles } from "../enums/role.enums";
dotenv.config();

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
      bucket,
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

router.post(
  "/",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.FINANCE]),
  getUpload().array("images", 3),
  merchandiseController.create
);

router.get(
  "/",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  merchandiseController.retrieveAll
);

router.get(
  "/active",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  merchandiseController.retrieveActive
);

router.get(
  "/retrieve-published",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  merchandiseController.retrievePublished
);

router.get(
  "/:id",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  merchandiseController.retrieveById
);

router.put(
  "/update/:_id",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.FINANCE]),
  getUpload().array("images", 3),
  merchandiseController.update
);

router.put(
  "/delete-soft",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.FINANCE]),
  merchandiseController.softDelete
);

router.put(
  "/publish",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2([psits_roles.ADMIN, psits_roles.FINANCE]),
  merchandiseController.publish
);

export default router;
