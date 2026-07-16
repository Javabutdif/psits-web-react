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
import { reportService } from "../services/report.service";
import { merchandiseService } from "../services/merchandise.service";
import { IStudent } from "../models/student.interface";
import {
  IOrderProcessingResult,
  IOrderFinalizationResult,
} from "../services/order.service.inteface";
import { IOrderPromoEligibility } from "../services/promo.service.interface";

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
      const result: IStudent = await studentService.getSpecific(user.id_number);
      if (!result) {
        throw new AppError("User does not exist!", 404);
      }
    }
    //Start to do transaction case in database
    const session = await mongoose.startSession();
    await session.startTransaction();

    //Process Order
    const processOrder: IOrderProcessingResult =
      await orderService.orderProcessingService(items, session);

    //Promo Code Validation
    const validation: IOrderPromoEligibility =
      await promoService.verifyOrderPromoEligibility(
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
    const finalOrder: IOrderFinalizationResult = orderService.processFinalOrder(
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

  /*
    To cancel an order, the admin will just need to provide the order id and then the system will check if the order is already approved or not, if it is already approved then the system will not allow to cancel the order, if it is still pending then the system will cancel the order and then return a message that the order is cancelled
  
  */
  cancelOrder = async (req: Request, res: Response) => {
    const { _id } = req.body;
    const result = await orderService.cancelOrderService(_id);

    return res.status(200).json({
      message: result.message,
    });
  };
  /*
    To approve an order, the admin will just need to provide the order id and then the system will check if the order is already approved or not, if it is already approved then the system will not allow to approve the order, if it is still pending then the system will approve the order and then return a message that the order is approved
  */
  approveOrder = async (req: Request, res: Response) => {
    const { order_id, admin, cash } = req.body;

    const checkOrder = await orderService.checkOrderApproveStatus(order_id);
    if (checkOrder.status) {
      return res.status(400).json({
        message: checkOrder.message,
      });
    }

    //Start session
    const session = await mongoose.startSession();
    await session.startTransaction();

    //Call for approve order service
    const result: any = await orderService.approveOrderService(
      order_id,
      admin,
      session
    );
    //Create a Stocks array for bulk update
    const productArray = result.items.map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));
    //Update the stocks of the products
    await merchandiseService.updateManyStocks(productArray, session);
    //Create a report data array
    const reportDataArray = result.items.map((item: any) => ({
      order_id: result._id,
      student_id: result.id_number,
      merch_id: item.product_id,
      item_count: item.quantity,
      total: item.sub_total,
      date: result.order_date,
    }));
    //Store the report data array to reports
    const processReports = await reportService.createReports(
      reportDataArray,
      session
    );
    if (!processReports.success) {
      session.abortTransaction();
      session.endSession();
      throw new AppError("Failed to create reports", 500);
    }
    //Create a receipt for the order
    const receipt: any = await orderService.generateOrderReceipt(
      result,
      admin,
      cash
    );
    //Call for order receipt service
    await orderReceipt(receipt, result.email);
    //End session and commit transaction
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      message: "Successfully approved order",
    });
  };
}

export const orderController = new OrderController();
