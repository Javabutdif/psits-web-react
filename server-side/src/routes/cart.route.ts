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
} from "../middlewares/authV2.middleware";
const router = Router();

//Student Add Cart
router.post(
  "/add-cart",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["student"]),
  addCartController
);
//Student View Cart
router.get(
  "/view-cart",
  requireAccessTokenV2,
  roleAuthenticateV2(["student"]),
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
