import { Router } from "express";
import {
  createPromoCode,
  getAllPromoCode,
  deletePromo,
  verifyPromo,
  getPromoLog,
  updatePromoCode,
} from "../controllers/promo.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
const router = Router();

router.post(
  "/create",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["finance", "admin"]),
  createPromoCode
);
router.get(
  "/fetch",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  getAllPromoCode
);
router.delete(
  "/delete/:id",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  deletePromo
);
router.get(
  "/verify/:promo_code/:merchId",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  verifyPromo
);
router.get(
  "/log",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getPromoLog
);
router.post(
  "/update",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  updatePromoCode
);

export default router;
