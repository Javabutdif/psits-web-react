import { Router } from "express";
import {
  getSpecificOrdersController,
  getAllOrdersController,
  getAllPendingOrdersController,
  getAllPaidOrdersController,
  studentAndAdminOrderController,
  cancelOrderController,
  approveOrderController,
  getAllPendingCountController,
  refund,
  getAllRefund
} from "../controllers/order.controller";
import {
  requireAccessTokenV2,
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2,
  adminAccessAuthenticateV2,
} from "../middlewares/authV2.middleware";
const router = Router();

//Get specific order via id_number
router.get(
  "/",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin", "student"]),
  getSpecificOrdersController
);
//Get all orders
router.get(
  "/get-all-orders",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllOrdersController
);

//orders/get-all-paid-orders
//get all pending orders
router.get(
  "/get-all-pending-orders",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllPendingOrdersController
);

//Get all paid orders
router.get(
  "/get-all-paid-orders",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllPaidOrdersController
);

router.post(
  "/student-order",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin", "student"]),
  studentAndAdminOrderController
);

// Cancel Order
router.put(
  "/cancel/:product_id",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin", "student"]),
  cancelOrderController
);

router.put(
  "/approve-order",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  approveOrderController
);

// orders.js (backend api)
router.get(
  "/get-all-pending-counts",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  getAllPendingCountController
);
router.post(
  "/refund",
  requireAccessTokenWithDBCheck,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  refund
)
router.get(
  "/get-refund",
  requireAccessTokenV2,
  roleAuthenticateV2(["admin"]),
  adminAccessAuthenticateV2(["admin", "finance"]),
  getAllRefund
)

export default router;
