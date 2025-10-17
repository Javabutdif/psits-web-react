import { Student } from "../models/student.model";
import { Event } from "../models/event.model";
import { CartItem } from "../models/cart.model";
import { Orders, IOrdersDocument } from "../models/orders.model";
import { Merch } from "../models/merch.model";
import { Log } from "../models/log.model";
import { Admin } from "../models/admin.model";
import { IOrders } from "../models/orders.interface";
import { IOrderReceipt } from "../mail_template/mail.interface";
import { orderSearch } from "../utils/search.pending.orders";
import { orderSort, ISort } from "../utils/sort.pending.orders";
//Initialize
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import { format } from "date-fns";
import { orderReceipt } from "../mail_template/mail.template";
import { Request, Response } from "express";

export const getSpecificOrdersController = async (
  req: Request,
  res: Response
) => {
  const { id_number } = req.query;

  try {
    const orders: IOrders[] = await Orders.find({
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
};

export const getAllOrdersController = async (req: Request, res: Response) => {
  try {
    const orders: IOrders[] = await Orders.find().sort({ order_date: -1 });
    if (orders.length > 0) {
      res.status(200).json(orders);
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json("Internal Server Error");
  }
};

export const getAllPendingOrdersController = async (
  req: Request,
  res: Response
) => {
  try {
    const orders: IOrders[] = await Orders.find({
      order_status: "Pending",
    }).sort({
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
};

export const getAllPaidOrdersController = async (
  req: Request,
  res: Response
) => {
  try {
    const orders: IOrders[] = await Orders.find({ order_status: "Paid" }).sort({
      transaction_date: -1,
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
};

export const studentAndAdminOrderController = async (
  req: Request,
  res: Response
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id_number, rfid, course, year, student_name, items, admin } =
      req.body;

    const itemsArray = Array.isArray(items) ? items : [items];

    const hasMissingFields =
      !id_number ||
      !rfid ||
      !student_name ||
      !course ||
      !year ||
      !itemsArray.length;

    if (hasMissingFields) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (admin) {
      const findAdmin = await Admin.findOne({ id_number: admin });
      if (findAdmin) {
        await new Log({
          admin: findAdmin.name,
          admin_id: findAdmin._id,
          action: "Make manual Order for [" + student_name + "]",
          target: "Manual Order [" + student_name + "]",
        }).save();
      }
    }

    const student = await Student.findOne({ id_number: id_number }).session(
      session
    );

    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Student not found" });
    }

    const processedItems = [];
    let orderTotal = 0;

    let finalMembershipDiscount = false;

    for (let item of itemsArray) {
      const productId = new Types.ObjectId(item.product_id);

      const findMerch = await Merch.findOne({ _id: productId }).session(
        session
      );
      if (!findMerch) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: `Product with ID ${productId} not found` });
      }

      const isStockInsufficient = findMerch.stocks < item.quantity;
      if (isStockInsufficient) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Insufficient stock for product: ${findMerch.name}. Available: ${findMerch.stocks}, Requested: ${item.quantity}`,
        });
      }

      let actualPrice = findMerch.price;

      // Check size-based price override
      if (item.sizes && item.sizes.length > 0 && findMerch.selectedSizes) {
        const selectedSize = Array.isArray(item.sizes)
          ? item.sizes[0]
          : item.sizes;
        const sizeConfig = findMerch.selectedSizes.get(selectedSize);
        if (sizeConfig && sizeConfig.price) {
          actualPrice = parseFloat(sizeConfig.price);
        }
      }

      let itemSubtotal = actualPrice * item.quantity;

      // Apply manual discount from frontend (if provided)
      if (item.discount && !isNaN(item.discount)) {
        const discountPercent = parseFloat(item.discount);
        const discountAmount = (itemSubtotal * discountPercent) / 100;
        itemSubtotal -= discountAmount;
      }

      // Membership discount (optional, can stack if you allow)
      const membership_discount =
        (student.membershipStatus === "ACTIVE" ||
          student.membershipStatus === "RENEWED") &&
        findMerch.category === "merchandise";

      if (membership_discount) {
        itemSubtotal = itemSubtotal - itemSubtotal * 0.05; // 5%
        finalMembershipDiscount = true;
      }

      const processedItem = {
        product_id: item.product_id,
        imageUrl1: findMerch.imageUrl?.[0],
        product_name: findMerch.name,
        limited: findMerch.control === "limited-purchase",
        price: actualPrice,
        discount: item.discount || 0, // keep record
        membership_discount,
        quantity: item.quantity,
        sub_total: itemSubtotal,
        variation: item.variation,
        sizes: item.sizes,
        batch: findMerch.batch,
      };

      processedItems.push(processedItem);
      orderTotal += itemSubtotal;
    }

    const finalOrder = {
      id_number,
      rfid,
      imageUrl1: processedItems[0]?.imageUrl1,
      membership_discount: finalMembershipDiscount,
      course,
      year,
      student_name,
      items: processedItems,
      total: orderTotal,
      order_date: new Date(),
      order_status: "Pending",
      role: student.role,
    };

    console.log("==========Final Order==========", finalOrder);

    const newOrder = new Orders(finalOrder);
    await newOrder.save({ session });

    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i];
      const productId = new Types.ObjectId(item.product_id);

      const findMerch = await Merch.findOne({ _id: productId }).session(
        session
      );

      if (!findMerch) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: `Product with ID ${productId} not found` });
      }

      const newStocks = findMerch.stocks - item.quantity;

      const merchStocks = await Merch.updateOne(
        { _id: productId },
        { $set: { stocks: newStocks } }
      ).session(session);

      if (merchStocks.modifiedCount === 0) {
        throw new Error(
          `Could not deduct the stocks for product ID ${productId}`
        );
      }

      // Remove from student cart
      await Student.updateOne(
        { id_number },
        { $pull: { cart: { product_id: productId } } }
      ).session(session);

      // Delete from Cart collection if item has _id
      if (item._id) {
        await CartItem.findByIdAndDelete(item._id).session(session);
      }
    }

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      message: "Order Placed Successfully",
      order_id: newOrder._id,
      total: finalOrder.total,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Order processing error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error: " + error.message });
  }
};

export const cancelOrderController = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { product_id } = req.params;

  if (!product_id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const productId = new Types.ObjectId(product_id);

  try {
    const order = await Orders.findById(productId).session(session);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const targetNames = order.items.map((item) => item.product_name).join(", ");

    for (const item of order.items) {
      const merchId = new Types.ObjectId(item.product_id);
      const merch = await Merch.findOne({ _id: merchId }).session(session);

      if (!merch) {
        return res.status(404).json({ message: "Merchandise not found" });
      }

      const newStocks = merch.stocks + item.quantity;

      // ✅ Make sure this uses the session
      await Merch.updateOne(
        { _id: merchId },
        { $set: { stocks: newStocks } },
        { session }
      );
    }

    await Orders.findByIdAndDelete(productId).session(session);

    if (req.admin) {
      const log = new Log({
        admin: req.admin.name,
        admin_id: req.admin._id,
        action: "Canceled Order",
        target: targetNames,
        target_id: order._id,
        target_model: "Order",
      });

      await log.save({ session });
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Order canceled successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    session.endSession();
  }
};

export const approveOrderController = async (req: Request, res: Response) => {
  const { transaction_date, reference_code, order_id, admin, cash } = req.body;

  const runWithRetry = async (
    fn: (session: mongoose.ClientSession) => Promise<void>
  ) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await fn(session);
        await session.commitTransaction();
        session.endSession();
        return;
      } catch (err: any) {
        await session.abortTransaction();
        session.endSession();
        if (
          err.errorLabels?.includes("TransientTransactionError") &&
          attempt < 2
        ) {
          console.warn(`Retrying transaction (attempt ${attempt + 1})...`);
          continue;
        }
        throw err;
      }
    }
  };

  try {
    await runWithRetry(async (session) => {
      if (!Types.ObjectId.isValid(order_id)) {
        throw new Error("Invalid order ID");
      }

      const orderId = new Types.ObjectId(order_id);
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
        { new: true, session }
      );

      if (!successfulOrder) {
        throw new Error("Order not found");
      }

      const student = await Student.findOne({
        id_number: successfulOrder.id_number,
      }).session(session);

      if (!student) {
        throw new Error("Student not found");
      }

      const { items } = successfulOrder;

      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const sizes = Array.isArray(item.sizes) ? item.sizes : [];
          const variations = Array.isArray(item.variation)
            ? item.variation
            : [];
          const merchId = new Types.ObjectId(item.product_id);

          const existMerch = await Merch.findOne({
            _id: item.product_id,
            "order_details.reference_code": reference_code,
          }).session(session);

          if (!existMerch) {
            await Merch.findByIdAndUpdate(
              item.product_id,
              {
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
                    size: sizes,
                    variation: variations,
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
              },
              { session }
            );

            const merchToGet = await Merch.findById(item.product_id).session(
              session
            );

            const event = await Event.findOne({ eventId: merchId }).session(
              session
            );

            if (event) {
              const campusData = event.sales_data.find(
                (s) => s.campus === student.campus
              );
              if (!campusData) {
                throw new Error("Invalid campus");
              }

              campusData.unitsSold += 1;
              campusData.totalRevenue += item.sub_total;

              event.totalUnitsSold += 1;
              event.totalRevenueAll += item.sub_total;
              await event.save({ session });

              // Update merch (if isEvent) and create instance of it as event attendee
              if (merchToGet) {
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
                        requirements: {
                          // false nalng ni uis HAHAHA
                          // set to false on order approval (e.g. if order is related to acquiantance/ict congress)
                          insurance: false,
                          prelim_payment: false,
                          midterm_payment: false
                        },
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
                  { session, upsert: true }
                );
              }
            }
          }
        }
      }

      const data: IOrderReceipt = {
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
        year: student.year || 0,
        admin: admin || "N/A",
        items: successfulOrder.items,
        cash: cash || "N/A",
        total: successfulOrder.total || 0,
      };

      await orderReceipt(data, student?.email ?? "noemail@gmail.com");
    });

    return res.status(200).json({
      message: "Order approved. Email may have failed.",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({
      message: "An error occurred while approving the order",
      error: error,
    });
  }
};

export const getAllPendingCountController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      sort = [{ field: "product_name", direction: "asc" }],
    } = req.query;

    // Base query for pending orders
    let query = { order_status: "Pending" };
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    let sortParam: ISort[] = [{ field: "product_name", direction: "asc" }];
    try {
      sortParam = JSON.parse(sort as string);
    } catch (err) {
      console.warn("Invalid sort param, using default");
    }

    // Fetch all pending orders
    let pendingOrders: IOrdersDocument[] = await Orders.find(query);

    // Apply search if present
    if (search) {
      pendingOrders = orderSearch(pendingOrders, search);
    }

    const productCounts: Record<
      string,
      { total: number; yearCounts: number[] }
    > = {};

    pendingOrders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.product_name.trim().toLowerCase(); // normalize product names

        if (!productCounts[name]) {
          productCounts[name] = {
            total: 0,
            yearCounts: [0, 0, 0, 0],
          };
        }

        // Add to total
        productCounts[name].total += item.quantity;

        // Safely increment by year
        if (order.year && order.year >= 1 && order.year <= 4) {
          productCounts[name].yearCounts[order.year - 1] += item.quantity;
        }
      });
    });

    // Convert products to array
    let result = Object.entries(productCounts).map(([productName, data]) => ({
      product_name: productName, // keep lowercase or format later
      total: data.total,
      yearCounts: data.yearCounts,
    }));

    // Apply sorting if present
    if (sort) {
      result = orderSort(result, sortParam);
    }

    // Pagination logic
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedResult = result.slice(startIndex, endIndex);

    res.status(200).json({
      data: paginatedResult,
      total: result.length,
      page: pageNum.toString(),
      totalPages: Math.ceil(result.length / limitNum),
    });
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
