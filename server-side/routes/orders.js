const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentModel");
const Admin = require("../models/AdminModel");
const Orders = require("../models/OrdersModel");
const Merch = require("../models/MerchModel");
const { ObjectId } = require("mongodb");
require("dotenv").config();

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
    course,
    year,
    student_name,
    product_id,
    product_name,
    category,
    sizes,
    variation,
    batch,
    quantity,
    total,
    order_date,
    order_status,
    limited,
  } = req.body;

  try {
    // Create and save new order
    const newOrder = new Orders({
      id_number,
      rfid,
      course,
      year,
      student_name,
      product_id,
      product_name,
      category,
      sizes,
      variation,
      batch,
      quantity,
      total,
      order_date,
      order_status,
      limited,
    });

    await newOrder.save();
    const productId = new ObjectId(product_id);

    const findMerch = await Merch.findOne({ _id: productId });

    if (!findMerch) {
      return res.status(404).json({ message: "Merchandise not found" });
    }

    const newStocks = findMerch.stocks - quantity;

    const merchStocks = await Merch.updateOne(
      { _id: productId },
      { $set: { stocks: newStocks } }
    );

    if (merchStocks.modifiedCount === 0) {
      return res.status(500).json({ message: "Could not deduct the stocks" });
    }

    res.status(200).json({ message: "Order Placed Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const merchId = new ObjectId(order.product_id);
    const merch = await Merch.findOne({ _id: merchId });

    if (!merch) {
      return res.status(404).json({ message: "Merchandise not found" });
    }

    const newStocks = merch.stocks + order.quantity;

    await Merch.updateOne({ _id: merchId }, { $set: { stocks: newStocks } });
    await Orders.findByIdAndDelete(productId);

    res.status(200).json({ message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
