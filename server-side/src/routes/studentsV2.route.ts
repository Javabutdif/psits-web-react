
import { Router } from "express";
import {
  getStudentLookupForAdmin,
  getStudentProfile,
  getStudentOrders,
  getStudentRefund,
} from "../controllers/studentV2.controller";
import { requireAccessTokenV2, roleAuthenticateV2 } from "../middlewares/authV2.middleware";

const router = Router();

router.get(
  "/lookup/:id_number",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getStudentLookupForAdmin
);

router.get("/profile/:id_number",   
  requireAccessTokenV2, 
  roleAuthenticateV2(["student"]), 
  getStudentProfile);

router.get(
  "/orders",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  getStudentOrders
);

router.get(
  "/refund/:orderId",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
  getStudentRefund
);

export default router;
