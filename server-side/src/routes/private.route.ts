import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
} from "../middlewares/authV2.middleware";
import loginLimiter from "../util/limiter.util";
//Added enum role
import { general_roles } from "../enums/role.enums";

import { Router, Request, Response } from "express";
const router = Router();

//protected route for admin
router.get(
  "/protected-route-admin",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  async (req: Request, res: Response) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Admin account not found" });
      }

      return res.status(200).json({
        user: req.admin,
        role: req.admin.role,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);
//Student route
router.get(
  "/protected-route-student",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  async (req: Request, res: Response) => {
    try {
      return res.status(200).json({
        user: req.userV2,
        role: req.userV2?.role,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
