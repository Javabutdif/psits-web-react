const express = require("express");
const Student = require("../models/StudentModel");
const Event = require("../models/EventsModel");
const Cart = require("../models/CartModel");
const Orders = require("../models/OrdersModel");
const Merch = require("../models/MerchModel");
const Log = require("../models/LogModel");
const Admin = require("../models/AdminModel");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const { format } = require("date-fns");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const {
  admin_authenticate,
  both_authenticate,
} = require("../middlewares/custom_authenticate_token");
const orderSearch = require("../utils/searchPendingOrders");
const orderSort = require("../utils/sortPendingOrders");
const mongoose = require("mongoose");

const router = express.Router();
router.get("/", both_authenticate, async (req, res) => {
  const { id_number } = req.query;

  try {
    const orders = await Orders.find({
      id_number: id_number,
    }).sort({ order_date: -1 });
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
router.get("/get-all-orders", admin_authenticate, async (req, res) => {
  try {
    const orders = await Orders.find().sort({ order_date: -1 });
    if (orders.length > 0) {
      res.status(200).json(orders);
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json("Internal Server Error");
  }
});

//orders/get-all-paid-orders
//get all pending orders
router.get("/get-all-pending-orders", admin_authenticate, async (req, res) => {
  try {
    const orders = await Orders.find({ order_status: "Pending" }).sort({
      order_date: -1,
    });

    if (orders.length > 0) {
      res.status(200).json(orders);
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json("Internal Server Error");
  }
});

//Get all paid orders
router.get("/get-all-paid-orders", admin_authenticate, async (req, res) => {
  try {
    const orders = await Orders.find({ order_status: "Paid" }).sort({
      order_date: -1,
    });
    if (orders.length > 0) {
      res.status(200).json(orders);
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json("Internal Server Error");
  }
});

router.post("/student-order", both_authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
    admin,
  } = req.body;
  const itemsArray = Array.isArray(items) ? items : [items];

  if (admin) {
    const findAdmin = await Admin.findOne({ id_number: admin });

    await new Log({
      admin: findAdmin.name,
      admin_id: findAdmin._id,
      action: "Make manual Order for [" + student_name + "]",
      target: "Manual Order [" + student_name + "]",
    }).save();
  }

  const student = await Student.findOne({ id_number: id_number }).session(
    session
  );

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
      role: student.role,
    });

    await newOrder.save();

    const findCart = await Student.findOne({ id_number }).session(session);

    if (!findCart) {
      return res.status(404).json({ message: "Student not found" });
    }

    for (let item of itemsArray) {
      const productId = new ObjectId(item.product_id);

      const findMerch = await Merch.findOne({ _id: productId }).session(
        session
      );

      if (!findMerch) {
        console.warn(`Merchandise with ID ${productId} not found`);
        continue;
      }

      const newStocks = findMerch.stocks - item.quantity;

      const merchStocks = await Merch.updateOne(
        { _id: productId },
        { $set: { stocks: newStocks } }
      ).session(session);

      if (merchStocks.modifiedCount === 0) {
        await session.abortTransaction();
        session.endSession();
        console.error(
          `Could not deduct the stocks for product ID ${productId}`
        );
      }

      await Student.updateOne(
        { id_number },
        { $pull: { cart: { product_id: productId } } }
      ).session(session);

      await Cart.findByIdAndDelete(item._id).session(session);
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Order Placed Successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Cancel Order
router.put("/cancel/:product_id", both_authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { product_id } = req.params;

  if (!product_id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const productId = new ObjectId(product_id);

  try {
    const order = await Orders.findById(productId).session(session);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prepare the target string by concatenating item names
    const targetNames = order.items.map((item) => item.product_name).join(", ");

    // Iterate through each item in the order
    for (const item of order.items) {
      const merchId = new ObjectId(item.product_id);
      const merch = await Merch.findOne({ _id: merchId }).session(session);

      if (!merch) {
        return res.status(404).json({ message: "Merchandise not found" });
      }

      const newStocks = merch.stocks + item.quantity;

      await Merch.updateOne({ _id: merchId }, { $set: { stocks: newStocks } });
    }

    // Delete the order after updating stock
    await Orders.findByIdAndDelete(productId).session(session);

    if (req.user.role === "Admin") {
      // Log the cancellation action
      const log = new Log({
        admin: req.user.name,
        admin_id: req.user._id,
        action: "Canceled Order",
        target: targetNames,
        target_id: order._id,
        target_model: "Order",
      });

      await log.save();
      //console.log("Action logged successfully.");
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Order canceled successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/approve-order", admin_authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
    ).session(session);

    if (!successfulOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const student = await Student.findOne({
      id_number: successfulOrder.id_number,
    }).session(session);

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
          const merchId = new ObjectId(item.product_id);

          const existMerch = await Merch.findOne({
            _id: item.product_id,
            "order_details.reference_code": reference_code,
          });

          if (!existMerch) {
            await Merch.findByIdAndUpdate(item.product_id, {
              $push: {
                order_details: {
                  reference_code: reference_code,
                  product_name: item.product_name,
                  id_number: successfulOrder.id_number,
                  student_name: successfulOrder.student_name,
                  rfid: successfulOrder.rfid,
                  course: successfulOrder.course,
                  year: successfulOrder.year,
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
            }).session(session);

            const merchToGet = await Merch.findById(item.product_id).session(
              session
            );

            const event = await Event.findOne({ eventId: merchId });

            if (event) {
              const campusData = event.sales_data.find(
                (s) => s.campus === student.campus
              );
              if (!campusData) {
                return res.status(400).json({ message: "Invalid campus" });
              }

              campusData.unitsSold += 1;
              campusData.totalRevenue += Number.parseInt(item.sub_total);

              event.totalUnitsSold += 1;
              event.totalRevenueAll += Number.parseInt(item.sub_total);
              event.save();

              // Add attendee if event exists and buyer is not already an attendee
              // Before, it only adds attendee if merch category == "ict_congress"
              // which is maybe wrong? We're handling different events, not only ict congress
              await Event.findOneAndUpdate(
                {
                  eventId: merchId,
                  "attendees.id_number": { $ne: successfulOrder.id_number },
                },
                {
                  $push: {
                    attendees: {
                      id_number: successfulOrder.id_number,
                      name: successfulOrder.student_name,
                      course: successfulOrder.course,
                      year: successfulOrder.year,
                      campus: student.campus,
                      attendance: {
                        morning: { attended: false, timestamp: "" },
                        afternoon: { attended: false, timestamp: "" },
                        evening: { attended: false, timestamp: "" },
                      },
                      shirtSize: sizes.length > 0 ? sizes[0] : null,
                      shirtPrice: merchToGet?.price || null,
                    },
                  },
                },
                { upsert: true }
              ).session(session);
            }
          }
        })
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Render and send the email
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/appr-order-receipt.ejs"),
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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: student.email,
      subject: "Your Order Receipt from PSITS - UC Main",
      html: emailTemplate,
      attachments: [
        {
          filename: "psits.jpg",
          path: path.join(__dirname, "../src/psits.jpg"),
          cid: "logo",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(200).json({
      message: "Order approved. Email may have failed.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error occurred:", error);
    res.status(500).json({
      message: "An error occurred while approving the order",
      error: error.message,
    });
  }
});

// orders.js (backend api)
router.get("/get-all-pending-counts", admin_authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = [{ field: "product_name", direction: "asc" }],
    } = req.query;

    // Base query for pending orders
    let query = { order_status: "Pending" };

    // Fetch all pending orders
    let pendingOrders = await Orders.find(query);

    // Apply search if present
    if (search) {
      pendingOrders = orderSearch(pendingOrders, search);
    }

    // Process the orders to get product counts
    const productCounts = {};

    pendingOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productCounts[item.product_name]) {
          productCounts[item.product_name] = {
            total: 0,
            yearCounts: [0, 0, 0, 0],
          };
        }
        productCounts[item.product_name].total += item.quantity;

        if (order.year >= 1 && order.year <= 4) {
          productCounts[item.product_name].yearCounts[order.year - 1] +=
            item.quantity;
        }
      });
    });

    // Convert products to array
    let result = Object.keys(productCounts).map((productName) => ({
      product_name: productName,
      total: productCounts[productName].total,
      yearCounts: productCounts[productName].yearCounts,
    }));

    // Apply sorting if present
    if (sort) {
      result = orderSort(result, sort);
    }

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResult = result.slice(startIndex, endIndex);

    res.status(200).json({
      data: paginatedResult,
      total: result.length,
      page: parseInt(page),
      totalPages: Math.ceil(result.length / limit),
    });
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
