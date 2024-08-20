const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
const Cart = require("../models/CartModel");
const Orders = require("../models/OrdersModel");
const Merch = require("../models/MerchModel");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const { format } = require("date-fns");

const router = express.Router();
router.get("/", async (req, res) => {
  const { id_number } = req.query;

  try {
    const orders = await Orders.find({
      id_number: id_number,
    });
    if (orders.length > 0) {
      res.status(200).json(orders);
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.get("/get-all-orders", async (req, res) => {
  try {
    const orders = await Orders.find();
    if (orders.length > 0) {
      res.status(200).json(orders);
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.post("/student-order", async (req, res) => {
  const {
    id_number,
    rfid,
    imageUrl1,
    membership_discount,
    course,
    year,
    student_name,
    items,
    total,
    order_date,
    order_status,
  } = req.body;
  const itemsArray = Array.isArray(items) ? items : [items];

  try {
    // Create and save new order
    const newOrder = new Orders({
      id_number,
      rfid,
      imageUrl1,
      membership_discount,
      course,
      year,
      student_name,
      items: itemsArray,
      total,
      order_date,
      order_status,
    });

    await newOrder.save();

    // Find the student
    const findCart = await Student.findOne({ id_number });

    if (!findCart) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Iterate over the items to process each one
    for (let item of itemsArray) {
      const productId = new ObjectId(item.product_id);

      // Find the merchandise
      const findMerch = await Merch.findOne({ _id: productId });

      if (!findMerch) {
        console.warn(`Merchandise with ID ${productId} not found`);
        continue; // Skip to the next item
      }

      const newStocks = findMerch.stocks - item.quantity;

      // Update the merchandise stock
      const merchStocks = await Merch.updateOne(
        { _id: productId },
        { $set: { stocks: newStocks } }
      );

      if (merchStocks.modifiedCount === 0) {
        console.error(
          `Could not deduct the stocks for product ID ${productId}`
        );
        // Proceed to process the remaining items
      }

      // Remove the cart item from the student document
      await Student.updateOne(
        { id_number },
        { $pull: { cart: { product_id: productId } } }
      );

      // Delete the cart item from the CartItem collection
      await Cart.findByIdAndDelete(item._id);
    }

    res.status(200).json({ message: "Order Placed Successfully" });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Cancel Order
router.put("/cancel/:product_id", async (req, res) => {
  const { product_id } = req.params;

  if (!product_id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const productId = new ObjectId(product_id);

  try {
    const order = await Orders.findById(productId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Iterate through each item in the order
    for (const item of order.items) {
      const merchId = new ObjectId(item.product_id);
      const merch = await Merch.findOne({ _id: merchId });

      if (!merch) {
        return res.status(404).json({ message: "Merchandise not found" });
      }

      const newStocks = merch.stocks + item.quantity;

      await Merch.updateOne({ _id: merchId }, { $set: { stocks: newStocks } });
    }

    // Delete the order after updating stock
    await Orders.findByIdAndDelete(productId);

    res.status(200).json({ message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/approve-order", async (req, res) => {
  const { reference_code, order_id, admin } = req.body;

  try {
    const orderId = new ObjectId(order_id);
    const successfulOrder = await Orders.updateOne(
      { _id: orderId },
      {
        $set: {
          reference_code: reference_code,
          order_status: "Paid",
          admin: admin,
          transaction_date: format(new Date(), "MMMM d, yyyy h:mm:ss a"),
        },
      }
    );

    if (!successfulOrder) {
      return res.status(404).json({ message: "Order didnt process" });
    }

    res.status(200).json({ message: "Approve Order Successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

module.exports = router;
