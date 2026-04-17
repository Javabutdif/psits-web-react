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
import { Promo } from "../models/promo.model";
//Initialize
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import { format } from "date-fns";
import { orderReceipt } from "../mail_template/mail.template";
import { Request, Response } from "express";
import { Refund } from "../models/refund.model";
import { refundCodeGenerator } from "../custom_function/code_generator";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildOrderSearchQuery = (search: string) => {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    return {};
  }

  const searchRegex = new RegExp(escapeRegex(trimmedSearch), "i");

  return {
    $or: [
      { student_name: searchRegex },
      { id_number: searchRegex },
      { rfid: searchRegex },
      { reference_code: searchRegex },
      { "items.product_name": searchRegex },
    ],
  };
};

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
    const orders: IOrders[] = await Orders.find({
      order_status: { $ne: "Refunded" },
    }).sort({ order_date: -1 });
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
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string, 10) || 50, 1);
    const search = (req.query.search as string) || "";
    const trimmedSearch = search.trim();

    const query = {
      order_status: "Pending",
      ...buildOrderSearchQuery(search),
    };

    console.log("[getAllPendingOrdersController] Fetching pending orders", {
      page,
      limit,
      search: trimmedSearch || null,
    });

    const total = await Orders.countDocuments(query);
    const orders: IOrders[] = await Orders.find(query)
      .sort({
        order_date: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("[getAllPendingOrdersController] Pending orders fetched", {
      total,
      returned: orders.length,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    });

    res.status(200).json({
      data: orders,
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    });
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
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string, 10) || 50, 1);
    const search = (req.query.search as string) || "";
    const trimmedSearch = search.trim();

    const query = {
      order_status: "Paid",
      ...buildOrderSearchQuery(search),
    };

    console.log("[getAllPaidOrdersController] Fetching paid orders", {
      page,
      limit,
      search: trimmedSearch || null,
    });

    const total = await Orders.countDocuments(query);
    const orders: IOrders[] = await Orders.find(query)
      .sort({
        transaction_date: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("[getAllPaidOrdersController] Paid orders fetched", {
      total,
      returned: orders.length,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    });

    res.status(200).json({
      data: orders,
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    });
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
    const { promo_name, promo_discount, items, admin } = req.body;
    const both = req.both;

    const itemsArray = Array.isArray(items) ? items : [items];

    const hasMissingFields = !itemsArray.length;

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
          action: "Make manual Order for [" + both.name + "]",
          target: "Manual Order [" + both.name + "]",
        }).save();
      }
    }

    const student = await Student.findOne({
      id_number: both.id_number,
    }).session(session);

    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Student not found" });
    }

    const processedItems = [];
    let orderTotal = 0;

    let finalMembershipDiscount = false;
    let promo;
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

      orderTotal += itemSubtotal;
      if (promo_discount) {
        promo = await Promo.findOne({ promo_name });
        if (promo) {
          if (promo.quantity <= 0 && promo.limit_type === "Limited") {
            return res
              .status(404)
              .json({ message: `Promo Code out of Stocks` });
          }
          await Promo.updateOne(
            {
              promo_name,
              "selected_merchandise._id": item.product_id,
              "selected_merchandise.items.id_number": { $ne: both.id_number },
            },
            {
              $push: {
                "selected_merchandise.$.items": {
                  id_number: both.id_number,
                  promo_used: new Date(),
                },
              },
              $inc: { quantity: -1 },
            }
          );
          orderTotal = orderTotal - orderTotal * (promo.discount / 100);
        }
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
        sub_total: orderTotal,
        variation: item.variation,
        sizes: item.sizes,
        batch: findMerch.batch,
      };

      processedItems.push(processedItem);
    }

    const finalOrder = {
      id_number: both.id_number,
      rfid: both.rfid,
      imageUrl1: processedItems[0]?.imageUrl1,
      membership_discount: finalMembershipDiscount,
      promo: {
        _id: promo?._id,
        promo_name: promo?.promo_name,
        promo_discount: promo_discount,
      },
      course: both.course,
      year: both.year,
      student_name: both.name,
      items: processedItems,
      total: orderTotal,
      order_date: new Date(),
      order_status: "Pending",
      role: both.role,
    };

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
        { id_number: both.id_number },
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
      if (order.promo.promo_discount) {
        await Promo.updateOne(
          {
            promo_name: order.promo.promo_name,
            "selected_merchandise._id": item.product_id,
          },
          {
            $pull: {
              "selected_merchandise.$.items": { id_number: order.id_number },
            },
            $inc: { quantity: 1 },
          }
        );
      }

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
                const selectedSize =
                  sizes.length > 0 ? String(sizes[0]).trim() : "";

                let resolvedShirtPrice: number | null = null;

                if (selectedSize && merchToGet.selectedSizes) {
                  const selectedSizesMap = merchToGet.selectedSizes as
                    | Map<string, { custom?: boolean; price?: string }>
                    | Record<string, { custom?: boolean; price?: string }>;

                  const sizeConfig =
                    selectedSizesMap instanceof Map
                      ? selectedSizesMap.get(selectedSize)
                      : selectedSizesMap[selectedSize];

                  const parsedSizePrice = Number(sizeConfig?.price);
                  if (Number.isFinite(parsedSizePrice)) {
                    resolvedShirtPrice = parsedSizePrice;
                  }
                }

                if (resolvedShirtPrice === null) {
                  const parsedOrderItemPrice = Number(item.price);
                  if (Number.isFinite(parsedOrderItemPrice)) {
                    resolvedShirtPrice = parsedOrderItemPrice;
                  }
                }

                if (resolvedShirtPrice === null) {
                  const parsedBasePrice = Number(merchToGet.price);
                  if (Number.isFinite(parsedBasePrice)) {
                    resolvedShirtPrice = parsedBasePrice;
                  }
                }

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
                        transactBy: successfulOrder.admin || admin || "System",
                        transactDate: successfulOrder.transaction_date
                          ? new Date(successfulOrder.transaction_date)
                          : new Date(),
                        attendance: {
                          morning: { attended: false, timestamp: "" },
                          afternoon: { attended: false, timestamp: "" },
                          evening: { attended: false, timestamp: "" },
                        },
                        shirtSize: selectedSize || null,
                        shirtPrice: resolvedShirtPrice,
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

export const refund = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { order_id } = req.body;
  console.log(order_id);

  if (!order_id) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  const orderId = new Types.ObjectId(order_id);

  try {
    const order = await Orders.findById(orderId).session(session);

    if (!order || order.order_status !== "Paid") {
      throw new Error("Order must exist and be paid before refund.");
    }

    await Orders.updateOne(
      { _id: orderId },
      { $set: { order_status: "Refunded" } },
      { session }
    );

    for (const item of order.items) {
      const merchId = new Types.ObjectId(item.product_id);
      const merch = await Merch.findOne({ _id: merchId });
      const result = await Merch.findOneAndUpdate(
        { _id: merchId },
        { $pull: { order_details: { reference_code: order.reference_code } } },
        { new: true, session }
      );

      if (!result) {
        throw new Error(`Failed to update merchandise ${merchId}`);
      }
      await new Refund({
        refund_id: refundCodeGenerator(),
        order_id: orderId,
        order_reference: order.reference_code,
        product_id: merchId,
        product_name: merch?.name,
        refund_price: item.sub_total,
        refund_admin: req.admin.name,
        refund_admin_id: req.admin.id_number,
        refund_date: new Date(),
      }).save();
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Refund processed successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error refund orders:", error);

    return res.status(500).json({
      error: "Refund process failed",
    });
  }
};

export const getAllRefund = async (req: Request, res: Response) => {
  try {
    const refunds = await Refund.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $lookup: {
          from: "merches",
          localField: "product_id",
          foreignField: "_id",
          as: "merch",
        },
      },

      { $unwind: "$order" },
      { $unwind: { path: "$merch", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          product_id: 1,
          product_name: 1,
          refund_price: 1,
          refund_date: 1,
          order_reference: 1,

          imageUrl: "$merch.imageUrl",

          order_details: {
            student_name: "$order.student_name",
            course: "$order.course",
            year: "$order.year",
            id_number: "$order.id_number",
            admin_name: "$refund_admin",
          },
        },
      },

      {
        $group: {
          _id: "$product_id",
          product_name: { $first: "$product_name" },
          imageUrl: { $first: "$imageUrl" }, // 👈 correct way
          total_refunds: { $sum: 1 },
          total_refund_amount: { $sum: "$refund_price" },
          refunds: { $push: "$$ROOT" },
        },
      },

      {
        $project: {
          _id: 0,
          product_id: "$_id",
          product_name: 1,
          imageUrl: 1,
          total_refunds: 1,
          total_refund_amount: 1,
          refunds: 1,
        },
      },
    ]).sort({ product_name: 1 });

    if (refunds.length > 0) {
      return res.status(200).json({ data: refunds });
    }

    return res.status(404).json({ message: "No refunds found" });
  } catch (error) {
    console.error("Error fetching refunds:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
