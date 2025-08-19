const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const {
  createMerchandiseController,
  retrieveActiveMerchandiseController,
  retrieveSpecificMerchandiseController,
  retrieveMerchAdminController,
  deleteReportController,
  updateMerchandiseController,
  softDeleteMerchandiseController,
  publishMerchandiseController,
} = require("../controllers/merchandise.controller");

require("dotenv").config();
const {
  admin_authenticate,
  both_authenticate,
} = require("../middlewares/custom_authenticate_token");
const router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `merchandise/${Date.now()}_${file.originalname}`);
    },
  }),
});

//Create Merchandise Route
router.post(
  "/",
  admin_authenticate,
  upload.array("images", 3),
  createMerchandiseController
);
//Retrieve All Active Merchandise
router.get("/retrieve", both_authenticate, retrieveActiveMerchandiseController);
//Retrieve Specific Merchandise
router.get(
  "/retrieve/:id",
  both_authenticate,
  retrieveSpecificMerchandiseController
);

router.get("/retrieve-admin", admin_authenticate, retrieveMerchAdminController);

router.delete("/delete-report", admin_authenticate, deleteReportController);

router.put(
  "/update/:_id",
  admin_authenticate,
  upload.array("images", 3),
  updateMerchandiseController
);

// DELETE merch by id (soft)
router.put("/delete-soft", admin_authenticate, softDeleteMerchandiseController);

// Publish merch
router.put("/publish", admin_authenticate, publishMerchandiseController);

module.exports = router;
