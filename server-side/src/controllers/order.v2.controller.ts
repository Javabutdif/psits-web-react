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
import { PromoUsage } from "../models/promo.usage.model";
//Initialize
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import { format } from "date-fns";
import { orderReceipt } from "../mail_template/mail.template";
import { Request, Response } from "express";
import { Refund } from "../models/refund.model";
import { refundCodeGenerator } from "../custom_function/code_generator";
import { orderService } from "../services/order.service";
import { adminService } from "../services/admin.service";
import { AppError } from "../util/app.error.util";
import { studentService } from "../services/student.service";
import { promoService } from "../services/promo.service";

class OrderController {
  //Specific Order using id number
  getSpecificOrder = async (req: Request, res: Response) => {
    const { id_number } = req.query;
    const result = await orderService.getSpecificOrderDynamic({ id_number });

    return res.status(200).json({
      message: "Successfully retrieved specific order",
      data: result,
    });
  };
  //Get all orders
  getAllOrders = async (req: Request, res: Response) => {
    const orders = await orderService.getAllOrders({});
    return res.status(200).json({
      message: "Successfully retrieved all orders",
      data: orders,
    });
  };
  //Get all pending / paid orders with params
  /*
  Structure in frontend for sending this request:
  params:{
    query.limit: number,
    query.search: string,
    query.page: number,
    status: Paid | Pending,

  }

  */
  getAllPendingPaidOrders = async (req: Request, res: Response) => {
    const result = await orderService.getAllOrdersDynamicStatus(req);
    return res.status(200).json({
      message: "Successfully retrieved pending and paid orders",
      data: result,
    });
  };
  //Create Order Controller
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

  this create order doesnt minus the stock of the items, it will just create the order and then the admin will approve it and then it will minus the stock of the items

  */
  createOrder = async (req: Request, res: Response) => {
    const { promo_id, items, admin } = req.body;
    const user = req.both;
    //Check user availability
    if (admin) {
      const result = await adminService.retrieveSpecific(admin);
      if (!result) {
        throw new AppError("User does not exist!", 404);
      }
    } else {
      const result = await studentService.getSpecific(user.id_number);
      if (!result) {
        throw new AppError("User does not exist!", 404);
      }
    }
    //Start to do transaction case in database
    const session = await mongoose.startSession();
    await session.startTransaction();

    //Process Order
    const processOrder = await orderService.orderProcessingService(
      items,
      session
    );

    //Promo Code Validation
    const validation = await promoService.verifyOrderPromoEligibility(
      promo_id,
      user,
      processOrder.orderItems
    );
    //Promo Code Discount Calculation
    const total =
      validation.promoDiscount.discount === 0
        ? processOrder.orderTotal
        : orderService.processDiscountAmount(
            processOrder.orderTotal,
            validation.promoDiscount.discount
          );
    //Process final Order
    const finalOrder = orderService.processFinalOrder(
      user,
      validation,
      processOrder,
      total
    );
    const newOrder = new Orders(finalOrder);
    await newOrder.save({ session });

    //Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Successfully created order",
    });
  };

  //Cancel Order Controller
  cancelOrder = async (req: Request, res: Response) => {
    const { _id } = req.body;
    const result = await orderService.cancelOrderService(_id);

    return res.status(200).json({
      message: result.message,
    });
  };
}

export const orderController = new OrderController();
