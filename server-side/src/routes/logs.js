const express = require("express");
const {
  getAllLogsController,
  addNewLogController,
} = require("../controllers/log.controller");
const {
  admin_authenticate,
} = require("../middlewares/custom_authenticate_token");

const router = express.Router();

// Fetch all logs
router.get("/", admin_authenticate, getAllLogsController);

// Add a new log
router.post("/", admin_authenticate, addNewLogController);

module.exports = router;
