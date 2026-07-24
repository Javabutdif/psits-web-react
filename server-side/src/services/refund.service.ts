import mongoose, { ClientSession, Types } from "mongoose";
import { Refund } from "../models/refund.model";
import { Report } from "../models/report.model";
import { Merch } from "../models/merch.model";
import { Orders } from "../models/orders.model";
import { refundCodeGenerator } from "../custom_function/code_generator";
import { merchandiseService } from "./merchandise.service";

class RefundService {
  //Refund Order Service
  createRefund = async (order: any, requestor: any) => {
    await Refund.create({
      refund_id: this.generateRefundCode(),
      order_id: order._id,
      order_reference: order.reference_code,
      product_id: order.product_id,
      product_name: order.product_name,
      refund_price: order.refund_price,
      refund_admin: requestor.refund_admin,
      refund_admin_id: requestor.refund_admin_id,
      refund_date: new Date(),
    });
  };
  //Generate Refund Code Service
  generateRefundCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();

    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `REF-${timestamp}-${randomString}`;
  };

  //Full refund for a paid order (V2)
  processRefund = async (
    orderId: string,
    adminName: string,
    adminIdNumber: string,
    session: ClientSession
  ) => {
    const oid = new Types.ObjectId(orderId);

    const order = await Orders.findById(oid).session(session);
    if (!order || order.order_status !== "Paid") {
      throw new Error("Order must exist and be paid before refund.");
    }

    // Set order status to Refunded
    await Orders.updateOne(
      { _id: oid },
      { $set: { order_status: "Refunded" } }
    ).session(session);

    // Create Refund docs per item + restore stock
    for (const item of order.items) {
      const merchId = new Types.ObjectId(item.product_id);
      const merch = await Merch.findOne({ _id: merchId }).session(session);

      await Refund.create([{
        refund_id: refundCodeGenerator(),
        order_id: oid,
        order_reference: order.reference_code,
        product_id: merchId,
        product_name: merch?.name || item.product_name,
        refund_price: item.sub_total,
        refund_admin: adminName,
        refund_admin_id: adminIdNumber,
        refund_date: new Date(),
      }], { session });

      // Restore stock
      await merchandiseService.restoreStocks(merchId, item.quantity, session);
    }

    // Delete report records tied to this order
    await Report.deleteMany({ order_id: oid }).session(session);

    return { message: "Refund processed successfully" };
  };
}

export const refundService = new RefundService();
