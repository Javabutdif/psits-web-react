
import { Router } from "express";
import {
  getStudentLookupForAdmin,
  getStudentProfile,
  getStudentOrders,
  getStudentRefund,
  getStudentMembershipStatusV2,
  requestStudentMembershipV2,
} from "../controllers/studentV2.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  requireActiveStudentMembershipV2,
} from "../middlewares/authV2.middleware";

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
  "/membership-status",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  getStudentMembershipStatusV2
);

router.put(
  "/membership-request",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  requestStudentMembershipV2
);

router.get(
  "/orders",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  requireActiveStudentMembershipV2,
  getStudentOrders
);

router.get(
  "/refund/:orderId",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  requireActiveStudentMembershipV2,
  getStudentRefund
);

export default router;
