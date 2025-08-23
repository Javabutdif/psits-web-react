const {
  admin_authenticate,
  student_authenticate,
} = require("../middlewares/custom_authenticate_token");

import { Router, Request, Response, NextFunction } from "express";
const router: Router = Router();

//protected route for admin
router.get(
  "/protected-route-admin",
  admin_authenticate,
  async (req: Request, res: Response) => {
    try {
      if (req.user?.role === "Admin") {
        return res.status(200).json({
          user: req.user,
          role: req.user.role,
        });
      } else return res.status(400).json({ message: "Access Denied" });
    } catch (error) {
      console.error(error);
    }
  }
);
//Student route
router.get(
  "/protected-route-student",
  student_authenticate,
  async (req, res) => {
    try {
      if (req.user.role === "Student") {
        return res.status(200).json({
          user: req.user,
          role: req.user.role,
        });
      } else return res.status(400).json({ message: "Access Denied" });
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = router;
