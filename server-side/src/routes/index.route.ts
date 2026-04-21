import { Router } from "express";
const router: Router = Router();

const {
  loginController,
  registerController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controllers/index.controller");

//lOGIN
router.post("/login", loginController);
//Register
router.post("/register", registerController);
// Student forgot password
router.post("/student/forgot-password", forgotPasswordController);
// Student reset password
router.post("/student/reset-password/:token", resetPasswordController);

export default router;
