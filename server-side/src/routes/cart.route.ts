import { Router } from "express";
import {
  addCartController,
  viewStudentCartController,
  deleteItemCartController,
} from "../controllers/cart.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  requireActiveStudentMembershipV2,
} from "../middlewares/authV2.middleware";
const router = Router();

//Student Add Cart
router.post(
  "/add-cart",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  requireActiveStudentMembershipV2,
  addCartController
);
//Student View Cart
router.get(
  "/view-cart",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  requireActiveStudentMembershipV2,
  viewStudentCartController
);
//Student Delete Cart Item
router.put(
  "/delete-item-cart",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  deleteItemCartController
);

export default router;
