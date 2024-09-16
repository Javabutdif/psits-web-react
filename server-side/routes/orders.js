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
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path"); // Import path module

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

    const findCart = await Student.findOne({ id_number });

    if (!findCart) {
      return res.status(404).json({ message: "Student not found" });
    }

    for (let item of itemsArray) {
      const productId = new ObjectId(item.product_id);

      const findMerch = await Merch.findOne({ _id: productId });

      if (!findMerch) {
        console.warn(`Merchandise with ID ${productId} not found`);
        continue;
      }

      const newStocks = findMerch.stocks - item.quantity;

      const merchStocks = await Merch.updateOne(
        { _id: productId },
        { $set: { stocks: newStocks } }
      );

      if (merchStocks.modifiedCount === 0) {
        console.error(
          `Could not deduct the stocks for product ID ${productId}`
        );
      }

      await Student.updateOne(
        { id_number },
        { $pull: { cart: { product_id: productId } } }
      );

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
  const { transaction_date, reference_code, order_id, admin, cash } = req.body;

  try {
    if (!ObjectId.isValid(order_id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const orderId = new ObjectId(order_id);
    const successfulOrder = await Orders.findByIdAndUpdate(
      orderId,
      {
        $set: {
          reference_code: reference_code,
          order_status: "Paid",
          admin: admin,
          transaction_date: transaction_date,
        },
      },
      { new: true }
    ); 

    if (!successfulOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const student = await Student.findOne({
      id_number: successfulOrder.id_number,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

  
    const { items } = successfulOrder;
    
    if (Array.isArray(items) && items.length > 0) {
      await Promise.all(
        items.map(async (item) => {
          const sizes = Array.isArray(item.sizes) ? item.sizes : [];
          const variations = Array.isArray(item.variation)
            ? item.variation
            : [];

          await Merch.findByIdAndUpdate(item.product_id, {
            $push: {
              order_details: {
                reference_code: reference_code,
                product_name: item.product_name,
                id_number: successfulOrder.id_number,
                student_name: successfulOrder.student_name,
                rfid: successfulOrder.rfid,
                batch: item.batch,
                size: { $each: sizes },
                variation: { $each: variations },
                quantity: item.quantity,
                total: item.sub_total,
                order_date: successfulOrder.order_date,
                transaction_date: successfulOrder.transaction_date,
              },
            },
            $inc: {
              "sales_data.unitsSold": item.quantity,
              "sales_data.totalRevenue": item.sub_total,
            },
          });
        })
      );
    }

    // Render the email template
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/appr-order-receipt.ejs"), // Path to the ejs file
      {
        reference_code: successfulOrder.reference_code,
        transaction_date: format(
          new Date(successfulOrder.transaction_date),
          "MMMM d, yyyy"
        ),
        student_name: student
          ? `${student.first_name} ${student.middle_name} ${student.last_name}`
          : "N/A",
        rfid: successfulOrder.rfid || "N/A",
        course: student.course || "N/A",
        year: student.year || "N/A",
        admin: admin || "N/A",
        items: successfulOrder.items,
        cash: cash || "N/A",
        total: successfulOrder.total || "N/A",
      }
    );

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: student.email, // Use the student's email
      subject: "Your Order Receipt from PSITS - UC Main",
      html: emailTemplate,
      attachments: [
        {
          filename: "psits.jpg",
          path: path.join(__dirname, "../src/psits.jpg"),
          cid: "logo", // Same CID as used in the EJS template
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending email", error });
      } else {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .json({ message: "Order approved and email sent" });
      }
    });
  } catch (error) {
    console.error("Error occurred:", error); // Log the error details with context
    res.status(500).json({
      message: "An error occurred while approving the order",
      error: error.message,
    });
  }
});

module.exports = router;
