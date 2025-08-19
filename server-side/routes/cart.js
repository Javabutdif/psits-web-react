const express = require("express");
const {
  addCartController,
  viewStudentCartController,
  deleteItemCartController,
} = require("../controllers/cart.controller");
const router = express.Router();
const {
  student_authenticate,
} = require("../middlewares/custom_authenticate_token");

//Student Add Cart
router.post("/add-cart", student_authenticate, addCartController);
//Student View Cart
router.get("/view-cart", student_authenticate, viewStudentCartController);
//Student Delete Cart Item
router.put("/delete-item-cart", student_authenticate, deleteItemCartController);

module.exports = router;
