import { Orders } from "../models/orders.model";
import { IOrders } from "../models/orders.interface";
import { startOfDay, endOfDay } from "date-fns";
import { AppError } from "../util/app.error.util";
import mongoose, { Types, ClientSession } from "mongoose";
import { merchandiseService } from "./merchandise.service";
import {
  IUserItems,
  IOrderProcessingResult,
  IOrderFinalizationResult,
} from "./order.service.inteface";
import { studentService } from "./student.service";
import { promoService } from "./promo.service";
import { IStudent } from "../models/student.interface";

//Object Order Service for order related database operations
class OrderService {
  //EscapeRegex for search
  escapeRegex = (text: string) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  };
  //buildOrderQuery for dynamic search
  buildOrderSearchQuery = (search: string) => {
    const trimmedSearch = search.trim();

    if (!trimmedSearch) {
      return {};
    }

    const searchRegex = new RegExp(this.escapeRegex(trimmedSearch), "i");

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

  //Pending Order Count
  getPendingCount = async () => {
    return Orders.countDocuments({
      order_status: "Pending",
    });
  };

  //Paid Order Count
  getPaidCount = async () => {
    return Orders.countDocuments({
      order_status: "Paid",
    });
  };
  //Admin Daily Sales
  getDailySales = async () => {
    const currentDate = new Date();
    const startOfDayDate = startOfDay(currentDate);
    const endOfDayDate = endOfDay(currentDate);

    const result: IOrders[] = await Orders.aggregate([
      {
        $match: {
          transaction_date: {
            $gte: startOfDayDate,
            $lte: endOfDayDate,
          },
          order_status: "Paid",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_name",
          totalQuantity: { $sum: "$items.quantity" },
          totalSubtotal: { $sum: "$items.sub_total" },
        },
      },
      {
        $project: {
          product_name: "$_id",
          totalQuantity: 1,
          totalSubtotal: 1,
          _id: 0,
        },
      },
    ]);
    if (!result) {
      throw new AppError("No orders!", 404);
    }
    return result;
  };
  //Update inside the order with dynamic $set of query
  updateOneDynamic = async (first_params: any, second_params: any) => {
    const result = await Orders.updateOne(first_params, {
      $set: second_params,
    });

    if (result.matchedCount === 0) {
      throw new AppError("No orders updated!", 404);
    }

    if (result.modifiedCount === 0) {
      return { status: true, message: "No changes made" };
    }

    return { status: true, message: "Orders updated successfully" };
  };

  //Get Specific Order with params
  //id_number,reference_code,transaction_date,order_status
  getSpecificOrderDynamic = async (params: any) => {
    const result = await Orders.find(params).sort({ order_date: -1 }).lean();
    if (!result) {
      throw new AppError("No orders found!", 404);
    }
    return result;
  };
  //Get all orders with params, excluding refunded orders
  getAllOrders = async (params: any = {}) => {
    const result = await Orders.find({
      ...params,
      order_status: { $ne: "Refunded" },
    })
      .sort({ order_date: -1 })
      .lean();
    if (!result) {
      throw new AppError("No orders found!", 404);
    }
    return result;
  };

  //Get all pending / paid orders
  //With search and pagination
  //Get all orders with dynamic status, search, and pagination
  getAllOrdersDynamicStatus = async (params: any) => {
    const page = Math.max(parseInt(params.query.page as string, 10) || 1, 1);
    const limit = Math.max(parseInt(params.query.limit as string, 10) || 50, 1);
    const search = (params.query.search as string) || "";
    const trimmedSearch = search.trim();
    const status = params.status;

    const total = status === "paid" ? await this.getPaidCount() : await this.getPendingCount();
    const result = await Orders.find({
      order_status: status,
      ...this.buildOrderSearchQuery(trimmedSearch),
    })
      .sort(status === "paid" ? { transaction_date: -1 } : { order_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return {
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  };

  //This service will process the order and return the orders subtotal and total
  orderProcessingService = async (
    items: IUserItems[],
    session: ClientSession
  ) => {
    let orderTotal = 0;
    let orderItems: IUserItems[] = [];

    const itemsArray = Array.isArray(items) ? items : [items];
    // Check if itemsArray is empty
    if (!itemsArray || itemsArray.length === 0) {
      throw new AppError("No items to process!", 400);
    }
    // Process each item in the order
    for (let item of itemsArray) {
      const productId = new Types.ObjectId(item.product_id);

      //Find Merch in item array
      const findMerch = await merchandiseService.checkExist(productId);
      if (!findMerch.data) {
        throw new AppError("Could not find Merchandise", 404);
      }
      //Check sufficient stocks if it is applicable for deduction, it does not less than 0
      const checkStocks = merchandiseService.checkSufficientStocks(
        findMerch.data.stocks,
        item.quantity
      );
      if (!checkStocks) {
        throw new AppError("Insufficient stocks to deduct!", 404);
      }
      //Check if merchandise is available
      if (!findMerch.status) {
        throw new AppError("Merchandise is not available", 404);
      }

      //Actual price
      let actualPrice = findMerch.data?.price;
      if (
        item.sizes &&
        item.sizes.length > 0 &&
        findMerch.data?.selectedSizes
      ) {
        const selectedSize = Array.isArray(item.sizes)
          ? item.sizes[0]
          : item.sizes;
        const sizeConfig = findMerch.data.selectedSizes.get(selectedSize);
        if (sizeConfig && sizeConfig.price) {
          actualPrice = parseFloat(sizeConfig.price);
        }
      }
      //Process for subtotal
      let itemSubTotal = actualPrice * item.quantity;
      //Process Order total
      orderTotal += itemSubTotal;

      //Update stocks in Database
      const update = await merchandiseService.updateStocks(
        item.product_id,
        item.quantity,
        session
      );
      if (!update) {
        throw new AppError("Could not update stocks in database", 404);
      }

      //This will be the process
      const processedItem: IUserItems = {
        product_id: item.product_id,
        product_name: findMerch.data?.name,
        limited: findMerch.data?.control === "limited-purchase",
        price: actualPrice,
        discount: item.discount || 0, // keep record
        quantity: item.quantity,
        sub_total: itemSubTotal,
        variation: item.variation,
        sizes: item.sizes,
        batch: findMerch.data?.batch,
        category: findMerch.data?.category,
      };

      //Push into the array
      orderItems.push(processedItem);
    }

    //Return process items
    return { orderItems, orderTotal };
  };

  //Process Final Order
  processFinalOrder = (
    user: IStudent,
    validation: any,
    processOrder: IOrderProcessingResult,
    total: number
  ): IOrderFinalizationResult => {
    const finalOrder: IOrderFinalizationResult = {
      id_number: user.id_number,
      promo: {
        _id: validation.promo._id,
        promo_name: validation.promo.promo_name,
        promo_discount: validation.promo.promo_discount,
      },
      course: user.course,
      year: user.year,
      student_name: studentService.fullNameFormat(user),
      items: processOrder.orderItems,
      total: total,
      order_date: new Date(),
      order_status: "Pending",
      role: user.role,
    };
    return finalOrder;
  };
  //Process discount amount total
  processDiscountAmount = (
    subTotal: number,
    discountPercent: number
  ): number => {
    const discountAmount = subTotal * (discountPercent / 100);
    return subTotal - discountAmount;
  };
  //Cancel Order Service
  cancelOrderService = async (_id: Types.ObjectId) => {
    const result = await Orders.findByIdAndDelete(_id);
    if (!result) {
      throw new AppError("Order not found!", 404);
    }

    return {
      message: "Order cancelled successfully",
    };
  };

  //Cancel Order Service with stock restore (V2 - full refund)
  cancelOrderWithStockRestore = async (
    _id: Types.ObjectId,
    session: ClientSession
  ) => {
    const order = await Orders.findById(_id).session(session);
    if (!order) {
      throw new AppError("Order not found!", 404);
    }

    // Restore stock for each item
    for (const item of order.items) {
      await merchandiseService.restoreStocks(item.product_id, item.quantity, session);
    }

    // Delete the order
    await Orders.findByIdAndDelete(_id, { session });

    return {
      message: "Order cancelled successfully. Stock restored.",
    };
  };
  //Approve Order Service
  approveOrderService = async (
    _id: Types.ObjectId,
    admin: string,
    session: ClientSession
  ) => {
    const result = await Orders.findByIdAndUpdate(
      _id,
      {
        order_status: "Paid",
        reference_code: this.generateReferenceCode(),
        transaction_date: new Date(),
        admin,
      },
      { new: true, session }
    );
    if (!result) {
      throw new AppError("Order not found!", 404);
    }
    return {
      status: true,
      items: result.items,
      id_number: result.id_number,
      order: result,
    };
  };
  //Generate Reference Code Service
  generateReferenceCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    return `${timestamp}-${randomString}`;
  };
  //Generate Order Receipt Service
  generateOrderReceipt = async (
    order: IOrders,
    admin: string,
    cash: number
  ) => {
    const receipt = {
      reference_code: order.reference_code,
      order_date: order.order_date,
      transaction_date: order.transaction_date,
      student_name: order.student_name,
      id_number: order.id_number,
      course: order.course,
      year: order.year,
      admin,
      items: order.items.map((item) => ({
        product_name: item.product_name,
        price: item.price,
      })),
      cash,
      total: order.total,
    };
    return receipt;
  };
  //Check if order is approved or not
  checkOrderApproveStatus = async (_id: Types.ObjectId) => {
    const result = await Orders.findById(_id);
    if (!result) {
      throw new AppError("Order not found!", 404);
    }
    if (result.order_status === "Paid") {
      return { status: true, message: "Order is already approved" };
    }
    return { status: false, message: "Order is not approved" };
  };
  //Check if order is Paid before refunding
  checkOrderPaidStatus = async (_id: Types.ObjectId) => {
    const result = await Orders.findById(_id);
    if (!result) {
      throw new AppError("Order not found!", 404);
    }
    if (result.order_status !== "Paid") {
      return { result, status: false, message: "Order is not paid" };
    }
    return { result, status: true, message: "Order is paid" };
  };

  //Process refund for a paid order (V2)
  processRefundService = async (_id: Types.ObjectId, adminName: string, adminId: string, session: ClientSession) => {
    const { Refund } = await import("../models/refund.model");
    const { Merch } = await import("../models/merch.model");
    const { refundCodeGenerator } = await import("../custom_function/code_generator");

    const order = await Orders.findById(_id).session(session);
    if (!order) {
      throw new AppError("Order not found!", 404);
    }
    if (order.order_status !== "Paid") {
      throw new AppError("Order is not paid or already refunded", 400);
    }

    // Update order status to Refunded
    await Orders.updateOne(
      { _id },
      { $set: { order_status: "Refunded" } }
    ).session(session);

    // Create refund records and restore stock per item
    for (const item of order.items) {
      const refundId = refundCodeGenerator();
      
      await Refund.create([{
        refund_id: refundId,
        order_id: _id,
        order_reference: order.reference_code || "",
        product_id: item.product_id,
        product_name: item.product_name,
        refund_price: item.sub_total,
        refund_admin: adminName,
        refund_admin_id: adminId,
        refund_date: new Date(),
      }], { session });

      // Restore stock
      await merchandiseService.restoreStocks(item.product_id, item.quantity, session);
    }

    return { message: "Refund processed successfully" };
  };
}

export const orderService = new OrderService();
