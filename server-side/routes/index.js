const express = require("express");

require("dotenv").config();
const {
  loginController,
  registerController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controllers/index.controller");
const loginLimiter = require("../util/limiter.util");
const router = express.Router();

//lOGIN
router.post("/login", loginLimiter, loginController);
//Register
router.post("/register", registerController);
// Student forgot password
router.post("/student/forgot-password", forgotPasswordController);
// Student reset password
router.post("/student/reset-password/:token", resetPasswordController);

module.exports = router;
