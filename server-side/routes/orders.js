const express = require("express");
require("dotenv").config();
const {
  admin_authenticate,
  both_authenticate,
} = require("../middlewares/custom_authenticate_token");
const {
  getSpecificOrdersController,
  getAllOrdersController,
  getAllPendingOrdersController,
  getAllPaidOrdersController,
  studentAndAdminOrderController,
  cancelOrderController,
  approveOrderController,
  getAllPendingCountController,
} = require("../controllers/order.controller");

const router = express.Router();

//Get specific order via id_number
router.get("/", both_authenticate, getSpecificOrdersController);
//Get all orders
router.get("/get-all-orders", admin_authenticate, getAllOrdersController);

//orders/get-all-paid-orders
//get all pending orders
router.get(
  "/get-all-pending-orders",
  admin_authenticate,
  getAllPendingOrdersController
);

//Get all paid orders
router.get(
  "/get-all-paid-orders",
  admin_authenticate,
  getAllPaidOrdersController
);

router.post(
  "/student-order",
  both_authenticate,
  studentAndAdminOrderController
);

// Cancel Order
router.put("/cancel/:product_id", both_authenticate, cancelOrderController);

router.put("/approve-order", admin_authenticate, approveOrderController);

// orders.js (backend api)
router.get(
  "/get-all-pending-counts",
  admin_authenticate,
  getAllPendingCountController
);

module.exports = router;
