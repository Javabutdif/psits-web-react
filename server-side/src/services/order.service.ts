import { Orders } from "../models/orders.model";
import { IOrders } from "../models/orders.interface";
import { startOfDay, endOfDay } from "date-fns";
import { AppError } from "../util/app.error.util";
import mongoose, { Types, ClientSession } from "mongoose";
import { merchandiseService } from "./merchandise.service";
import { adminService } from "./admin.service";
import { studentService } from "./student.service";
import { promoService } from "./promo.service";

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
    const count = await Orders.countDocuments({
      order_status: "Pending",
    });
    if (!count) {
      throw new AppError("No pending orders count found!", 404);
    }
    return count;
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
    const result = await Orders.updateMany(
      { first_params },
      { $set: second_params }
    );

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
  getAllOrders = async (params: any) => {
    const result = await Orders.find(
      { params },
      { order_status: { $ne: "Refunded" } }
    )
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

    const total = await this.getPendingCount();
    const result = await Orders.find({
      order_status: params.status,
      ...this.buildOrderSearchQuery(trimmedSearch),
    })
      .sort({ order_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (!result) {
      throw new AppError("No orders found!", 404);
    }
    return {
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  };

  //Create Order
  /*
  The previous logic is we have dynamic order process where in students and admin can order, thus the req.both is where who is processing the order

  if it is the student then we will get it. or an admin


  so I will add a parameter of requestor.
  The requestor is coming from the authorization handler 

  the params are
  1. promo_id = if ever naa
  2. items [order items]
  3. admin (if ever naa)

  then requestor

  */
  createOrderService = async (params: any, requestor: any) => {
    //Check user availability
    if (params.admin) {
      const result = await adminService.retrieveSpecific(params.admin);
      if (!result) {
        throw new AppError("User does not exist!", 404);
      }
    } else {
      const result = await studentService.getSpecific(requestor.id_number);
      if (!result) {
        throw new AppError("User does not exist!", 404);
      }
    }

    //Start to do transaction case in database
    const session = await mongoose.startSession();
    await session.startTransaction();

    //Process Order
    const processOrder = await this.orderProcessingService(
      params.items,
      session
    );

    //Promo Code Validation
    const validation = await promoService.verifyOrderPromoEligibility(
      params.promo_id,
      requestor,
      processOrder.orderItems
    );
    //Promo Code Discount Calculation
    const total =
      validation.promoDiscount.discount === 0
        ? processOrder.orderTotal
        : this.processDiscountAmount(
            processOrder.orderTotal,
            validation.promoDiscount.discount
          );
    //Process final Order
    const finalOrder = this.processFinalOrder(
      requestor,
      validation,
      processOrder,
      total
    );
    const newOrder = new Orders(finalOrder);
    await newOrder.save({ session });
  };

  //This service will process the order and return the orders subtotal and total
  orderProcessingService = async (items: any, session: ClientSession) => {
    let orderTotal = 0;
    let orderItems: any[] = [];

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
      const processedItem = {
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
    requestor: any,
    validation: any,
    processOrder: any,
    total: number
  ) => {
    const finalOrder = {
      id_number: requestor.id_number,
      rfid: requestor.rfid,
      promo: {
        _id: validation.promo._id,
        promo_name: validation.promo.promo_name,
        promo_discount: validation.promo.promo_discount,
      },
      course: requestor.course,
      year: requestor.year,
      student_name: requestor.name,
      items: processOrder.orderItems,
      total: total,
      order_date: new Date(),
      order_status: "Pending",
      role: requestor.role,
    };
    return finalOrder;
  };
  processDiscountAmount = (subTotal: number, discountPercent: number) => {
    const discountAmount = subTotal * (discountPercent / 100);
    return subTotal - discountAmount;
  };
}

export const orderService = new OrderService();
